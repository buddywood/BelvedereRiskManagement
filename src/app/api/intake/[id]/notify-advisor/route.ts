import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendAdvisorIntakeNotification } from '@/lib/email';
import { createNotification } from '@/lib/data/advisor';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate - require any authenticated user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get interview ID from URL params
    const params = await props.params;
    const interviewId = params.id;

    if (!interviewId) {
      return NextResponse.json({ error: 'Interview ID required' }, { status: 400 });
    }

    // Look up the IntakeInterview to get userId (the client)
    const interview = await prisma.intakeInterview.findUnique({
      where: { id: interviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    // Find active advisor assignments for this client
    const assignments = await prisma.clientAdvisorAssignment.findMany({
      where: {
        clientId: interview.userId,
        status: 'ACTIVE',
      },
      include: {
        advisor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    let notifiedCount = 0;

    // Process each assigned advisor
    for (const assignment of assignments) {
      try {
        const advisor = assignment.advisor;
        const advisorUser = advisor.user;

        // Create in-app notification
        await createNotification(
          advisor.id,
          'NEW_INTAKE',
          `New Intake: ${interview.user.name}`,
          `${interview.user.name} has completed their intake interview and is ready for review.`,
          interviewId
        );

        // Send email notification
        const reviewUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/advisor/review/${interviewId}`;

        await sendAdvisorIntakeNotification(
          advisorUser.email,
          advisorUser.name || 'Advisor',
          interview.user.name || 'Client',
          interview.user.email,
          reviewUrl
        );

        notifiedCount++;
      } catch (advisorError) {
        // Log error for this advisor but continue with others
        console.error(`Failed to notify advisor ${assignment.advisor.id}:`, advisorError);
      }
    }

    return NextResponse.json({ success: true, notifiedCount });
  } catch (error) {
    console.error('Failed to process advisor notifications:', error);
    return NextResponse.json(
      { error: 'Failed to process notifications' },
      { status: 500 }
    );
  }
}