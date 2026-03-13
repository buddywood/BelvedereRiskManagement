'use server';

import { auth } from '@/lib/auth';
import {
  createHouseholdMemberRecord,
  deleteHouseholdMemberRecord,
  updateHouseholdMemberRecord,
  listHouseholdMembers,
} from '@/lib/data/household-members';
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

    const member = await createHouseholdMemberRecord(userId, validatedFields.data);

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

    const member = await updateHouseholdMemberRecord(userId, id, validatedFields.data);

    if (!member) {
      return { success: false, error: 'Household member not found' };
    }

    revalidatePath('/profiles');
    return { success: true, member };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update household member';
    return { success: false, error: message };
  }
}

// Get all household members for current user
export async function getHouseholdMembers() {
  try {
    const userId = await getAuthUserId();
    const members = await listHouseholdMembers(userId);

    return { success: true, members };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get household members';
    return { success: false, error: message, members: null };
  }
}

// Delete a household member
export async function deleteHouseholdMember(id: string) {
  try {
    const userId = await getAuthUserId();
    const deleted = await deleteHouseholdMemberRecord(userId, id);

    if (!deleted) {
      return { success: false, error: 'Household member not found' };
    }

    revalidatePath('/profiles');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete household member';
    return { success: false, error: message };
  }
}