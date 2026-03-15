import "server-only";

import { prisma } from "@/lib/db";
import type { PipelineClient, PipelineMetrics, ClientWorkflowStage } from "./types";
import { computeClientStage, computeProgress, isStalled } from "./status";

/**
 * Fetches complete pipeline data for an advisor's clients
 */
export async function getClientPipeline(advisorProfileId: string): Promise<PipelineClient[]> {
  const assignments = await prisma.clientAdvisorAssignment.findMany({
    where: {
      advisorId: advisorProfileId,
      status: 'ACTIVE',
    },
    include: {
      client: {
        include: {
          // Get client profile for additional info
          clientProfile: true,
          // Get latest intake interview
          intakeInterviews: {
            orderBy: {
              updatedAt: 'desc'
            },
            take: 1,
          },
          // Get latest completed assessment
          assessments: {
            where: {
              status: 'COMPLETED'
            },
            orderBy: {
              completedAt: 'desc'
            },
            take: 1,
            include: {
              scores: {
                orderBy: {
                  calculatedAt: 'desc'
                },
                take: 1,
              }
            }
          }
        }
      }
    }
  });

  // For each client, also get invitation data and document requirements
  const clients = await Promise.all(assignments.map(async (assignment) => {
    const client = assignment.client;

    // Get latest invitation for this client from this advisor
    const invitation = await prisma.inviteCode.findFirst({
      where: {
        createdBy: advisorProfileId,
        prefillEmail: client.email,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get document requirements for this client-advisor pair
    const documentCounts = await prisma.documentRequirement.groupBy({
      by: ['fulfilled'],
      where: {
        advisorId: advisorProfileId,
        clientId: client.id,
      },
      _count: {
        fulfilled: true,
      }
    });

    const documentsRequired = documentCounts.find(g => g.fulfilled === false)?._count.fulfilled || 0;
    const documentsFulfilled = documentCounts.find(g => g.fulfilled === true)?._count.fulfilled || 0;

    // Get the most recent activity date
    const latestIntake = client.intakeInterviews[0];
    const latestAssessment = client.assessments[0];

    const activityDates = [
      assignment.assignedAt,
      invitation?.statusUpdatedAt,
      latestIntake?.updatedAt,
      latestAssessment?.updatedAt || latestAssessment?.completedAt,
    ].filter(Boolean) as Date[];

    const lastActivity = activityDates.length > 0
      ? new Date(Math.max(...activityDates.map(d => d.getTime())))
      : assignment.assignedAt;

    // Compute stage from all available data
    const stage = computeClientStage({
      invitation: invitation ? {
        status: invitation.status,
        statusUpdatedAt: invitation.statusUpdatedAt,
      } : undefined,
      intake: latestIntake ? {
        status: latestIntake.status,
        updatedAt: latestIntake.updatedAt,
      } : undefined,
      assessment: latestAssessment ? {
        status: latestAssessment.status,
        completedAt: latestAssessment.completedAt,
        updatedAt: latestAssessment.updatedAt,
      } : undefined,
      documents: {
        required: documentsRequired,
        fulfilled: documentsFulfilled,
      }
    });

    const pipelineClient: PipelineClient = {
      id: client.id,
      name: client.name,
      email: client.email,
      assignedAt: assignment.assignedAt,
      stage,
      progress: computeProgress(stage),
      lastActivity,
      invitation: invitation ? {
        status: invitation.status,
        sentAt: invitation.createdAt,
        code: invitation.code,
      } : null,
      intake: latestIntake ? {
        status: latestIntake.status,
        responseCount: await prisma.intakeResponse.count({
          where: {
            interviewId: latestIntake.id,
            answeredAt: { not: null }
          }
        }),
        submittedAt: latestIntake.submittedAt,
      } : null,
      assessment: latestAssessment ? {
        status: latestAssessment.status,
        completedAt: latestAssessment.completedAt,
        score: latestAssessment.scores[0]?.score || null,
      } : null,
      documents: {
        required: documentsRequired,
        fulfilled: documentsFulfilled,
      }
    };

    return pipelineClient;
  }));

  // Sort by lastActivity descending by default
  return clients.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
}

/**
 * Computes pipeline metrics from client data
 */
export function getPipelineMetrics(clients: PipelineClient[]): PipelineMetrics {
  const total = clients.length;

  // Count by stage
  const byStage = clients.reduce((acc, client) => {
    acc[client.stage] = (acc[client.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Ensure all stages are represented
  const allStages: Record<ClientWorkflowStage, number> = {
    INVITED: byStage.INVITED || 0,
    REGISTERED: byStage.REGISTERED || 0,
    INTAKE_IN_PROGRESS: byStage.INTAKE_IN_PROGRESS || 0,
    INTAKE_COMPLETE: byStage.INTAKE_COMPLETE || 0,
    ASSESSMENT_IN_PROGRESS: byStage.ASSESSMENT_IN_PROGRESS || 0,
    ASSESSMENT_COMPLETE: byStage.ASSESSMENT_COMPLETE || 0,
    DOCUMENTS_REQUIRED: byStage.DOCUMENTS_REQUIRED || 0,
    COMPLETE: byStage.COMPLETE || 0,
  };

  // Count documents needed
  const documentsNeeded = clients.filter(client =>
    client.documents.required > client.documents.fulfilled
  ).length;

  // Count stalled clients
  const stalled = clients.filter(client =>
    isStalled(client.lastActivity, client.stage)
  ).length;

  return {
    total,
    byStage: allStages,
    documentsNeeded,
    stalled,
  };
}