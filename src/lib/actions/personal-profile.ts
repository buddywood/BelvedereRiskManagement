'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getAdvisorProfileOrThrow } from '@/lib/advisor/auth';
import {
  advisorPersonalDetailsSchema,
  clientPersonalDetailsSchema,
  type AdvisorPersonalDetailsFormData,
  type ClientPersonalDetailsFormData,
} from '@/lib/schemas/profile';
import { revalidatePath } from 'next/cache';

export async function getAdvisorPersonalDetails() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, data: null, error: 'Not authenticated' };
  try {
    const profile = await getAdvisorProfileOrThrow(session.user.id);
    const user = profile.user as { firstName?: string | null; lastName?: string | null };
    return {
      success: true,
      data: {
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        phone: profile.phone ?? '',
        jobTitle: profile.jobTitle ?? '',
      } as AdvisorPersonalDetailsFormData,
      error: null,
    };
  } catch {
    return { success: false, data: null, error: 'Advisor profile not found' };
  }
}

export async function updateAdvisorPersonalDetails(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };
  const parsed = advisorPersonalDetailsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Invalid data', errors: parsed.error.flatten().fieldErrors };
  }
  try {
    const profile = await getAdvisorProfileOrThrow(session.user.id);
    const { firstName, lastName, phone, jobTitle } = parsed.data;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          firstName: firstName?.trim() || null,
          lastName: lastName?.trim() || null,
        },
      }),
      prisma.advisorProfile.update({
        where: { id: profile.id },
        data: {
          phone: phone?.trim() || null,
          jobTitle: jobTitle?.trim() || null,
        },
      }),
    ]);
    revalidatePath('/settings');
    revalidatePath('/advisor');
    return { success: true, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update advisor profile';
    return { success: false, error: message };
  }
}

export async function getClientPersonalDetails() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, data: null, error: 'Not authenticated' }
  try {
    const [profile, user] = await Promise.all([
      prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { firstName: true, lastName: true },
      }),
    ]);
    const data: ClientPersonalDetailsFormData = {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: profile?.phone ?? '',
      addressLine1: profile?.addressLine1 ?? '',
      addressLine2: profile?.addressLine2 ?? '',
      city: profile?.city ?? '',
      state: profile?.state ?? '',
      postalCode: profile?.postalCode ?? '',
      country: profile?.country ?? '',
      dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.toISOString().slice(0, 10) : '',
    };
    return { success: true, data, error: null };
  } catch {
    return { success: false, data: null, error: 'Failed to load profile' };
  }
}

export async function updateClientPersonalDetails(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };
  const parsed = clientPersonalDetailsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Invalid data', errors: parsed.error.flatten().fieldErrors };
  }
  try {
    const {
      firstName,
      lastName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      dateOfBirth,
    } = parsed.data;
    const dob = dateOfBirth?.trim() ? new Date(dateOfBirth.trim()) : null;
    if (dob && isNaN(dob.getTime())) {
      return { success: false, error: 'Invalid date of birth' };
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          firstName: firstName?.trim() || null,
          lastName: lastName?.trim() || null,
        },
      }),
      prisma.clientProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          phone: phone?.trim() || null,
          addressLine1: addressLine1?.trim() || null,
          addressLine2: addressLine2?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          postalCode: postalCode?.trim() || null,
          country: country?.trim() || null,
          dateOfBirth: dob,
        },
        update: {
          phone: phone?.trim() || null,
          addressLine1: addressLine1?.trim() || null,
          addressLine2: addressLine2?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          postalCode: postalCode?.trim() || null,
          country: country?.trim() || null,
          dateOfBirth: dob,
        },
      }),
    ]);
    revalidatePath('/settings');
    return { success: true, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update profile';
    return { success: false, error: message };
  }
}
