import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCustomizationForUser } from '@/lib/data/assessment-customization';

/**
 * GET /api/assessment/customization
 *
 * Returns customization configuration for the authenticated user.
 * Returns { isCustomized: false } if no approved intake exists.
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch customization config for user
    const customizationConfig = await getCustomizationForUser(session.user.id);

    if (!customizationConfig) {
      // No approved intake - return standard assessment config
      return NextResponse.json({
        isCustomized: false,
        visibleSubCategories: [],
        emphasisAreas: [],
        emphasisMultiplier: 1.0,
      });
    }

    return NextResponse.json(customizationConfig);
  } catch (error) {
    console.error('Error fetching assessment customization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customization config' },
      { status: 500 }
    );
  }
}