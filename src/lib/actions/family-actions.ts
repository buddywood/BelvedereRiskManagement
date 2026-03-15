'use server';

import { auth } from '@/lib/auth';
import { getFamilyDashboardData } from '@/lib/family/queries';
import type { FamilyDashboardData } from '@/lib/family/types';

/**
 * Get family dashboard data for the authenticated user
 * Returns null for unauthenticated requests or errors
 */
export async function getFamilyDashboard(): Promise<FamilyDashboardData | null> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    return await getFamilyDashboardData(session.user.id);
  } catch (error) {
    console.error('Failed to get family dashboard data:', error);
    return null;
  }
}