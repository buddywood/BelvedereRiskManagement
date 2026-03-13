'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { householdMemberSchema, updateHouseholdMemberSchema } from '@/lib/schemas/profile';
import { revalidatePath } from 'next/cache';

// Helper function to get authenticated user ID
async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }
  return session.user.id;
}

// Get all household members for the authenticated user
export async function getHouseholdMembers() {
  try {
    const userId = await getAuthUserId();

    const members = await prisma.householdMember.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return { success: true, members };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch household members';
    return { success: false, error: message };
  }
}

// Create a new household member
export async function createHouseholdMember(data: unknown) {
  try {
    const userId = await getAuthUserId();

    const validatedFields = householdMemberSchema.safeParse(data);
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const member = await prisma.householdMember.create({
      data: {
        ...validatedFields.data,
        userId,
      },
    });

    revalidatePath('/profiles');
    return { success: true, member };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create household member';
    return { success: false, error: message };
  }
}

// Update an existing household member
export async function updateHouseholdMember(id: string, data: unknown) {
  try {
    const userId = await getAuthUserId();

    const validatedFields = updateHouseholdMemberSchema.safeParse(data);
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const member = await prisma.householdMember.update({
      where: { id, userId }, // Ensure ownership
      data: validatedFields.data,
    });

    revalidatePath('/profiles');
    return { success: true, member };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update household member';
    return { success: false, error: message };
  }
}

// Delete a household member
export async function deleteHouseholdMember(id: string) {
  try {
    const userId = await getAuthUserId();

    await prisma.householdMember.delete({
      where: { id, userId }, // Ensure ownership
    });

    revalidatePath('/profiles');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete household member';
    return { success: false, error: message };
  }
}