import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { PipelineClient, PipelineMetrics, ClientWorkflowStage, ClientDetail, WorkflowEvent } from "./types";
import { computeClientStage, computeProgress, isStalled } from "./status";

/** Voice answers often omit `answeredAt` until later; typed answers set it. */
function whereIntakeResponseHasAnswer(interviewId: string): Prisma.IntakeResponseWhereInput {
  return {
    interviewId,
    OR: [
      { answeredAt: { not: null } },
      { audioUrl: { not: null } },
      {
        AND: [{ transcription: { not: null } }, { NOT: { transcription: { equals: "" } } }],
      },
    ],
  };
}

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
    const intakeWaived = assignment.intakeWaivedAt != null;
    const intakeForStage =
      latestIntake != null
        ? {
            status: latestIntake.status,
            updatedAt: latestIntake.updatedAt,
            submittedAt: latestIntake.submittedAt,
            waived: intakeWaived,
          }
        : intakeWaived
          ? {
              status: "NOT_STARTED" as const,
              updatedAt: assignment.assignedAt,
              submittedAt: null as Date | null,
              waived: true as const,
            }
          : undefined;

    const stage = computeClientStage({
      invitation: invitation ? {
        status: invitation.status,
        statusUpdatedAt: invitation.statusUpdatedAt,
      } : undefined,
      intake: intakeForStage,
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
      intake: latestIntake
        ? {
            status: latestIntake.status,
            responseCount: await prisma.intakeResponse.count({
              where: whereIntakeResponseHasAnswer(latestIntake.id),
            }),
            submittedAt: latestIntake.submittedAt,
            waivedAt: assignment.intakeWaivedAt,
          }
        : intakeWaived
          ? {
              status: "NOT_STARTED",
              responseCount: 0,
              submittedAt: null,
              waivedAt: assignment.intakeWaivedAt,
            }
          : null,
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

/**
 * Fetches detailed data for a single client including timeline and requirements
 */
export async function getClientDetail(advisorProfileId: string, clientId: string): Promise<ClientDetail> {
  // Verify advisor-client assignment exists (multi-tenant isolation)
  const assignment = await prisma.clientAdvisorAssignment.findFirst({
    where: {
      advisorId: advisorProfileId,
      clientId,
      status: 'ACTIVE',
    },
    include: {
      client: {
        include: {
          clientProfile: true,
          intakeInterviews: {
            orderBy: { updatedAt: 'desc' },
          },
          assessments: {
            orderBy: { completedAt: 'desc' },
            include: {
              scores: {
                orderBy: { calculatedAt: 'desc' },
                take: 1,
              }
            }
          }
        }
      }
    }
  });

  if (!assignment) {
    throw new Error('Client not found or not assigned to you');
  }

  const client = assignment.client;

  // Fetch invitation data
  const invitation = await prisma.inviteCode.findFirst({
    where: {
      createdBy: advisorProfileId,
      prefillEmail: client.email,
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch document requirements
  const documentRequirements = await prisma.documentRequirement.findMany({
    where: {
      advisorId: advisorProfileId,
      clientId,
    },
    orderBy: { createdAt: 'asc' }
  });

  // Get the latest intake and assessment
  const latestIntake = client.intakeInterviews[0];
  const latestAssessment = client.assessments[0];

  // Build timeline events
  const events: WorkflowEvent[] = [];

  // Client assignment
  events.push({
    stage: 'INVITED',
    label: 'Client Assigned',
    date: assignment.assignedAt,
    detail: 'Advisor-client relationship established'
  });

  // Invitation events
  if (invitation) {
    events.push({
      stage: 'INVITED',
      label: 'Invitation Sent',
      date: invitation.createdAt,
      detail: `Invitation code: ${invitation.code}`
    });

    if (invitation.status !== 'SENT' && invitation.statusUpdatedAt) {
      events.push({
        stage: invitation.status === 'REGISTERED' ? 'REGISTERED' : 'INVITED',
        label: invitation.status === 'REGISTERED' ? 'Client Registered' : 'Invitation Updated',
        date: invitation.statusUpdatedAt,
        detail: `Status changed to ${invitation.status.toLowerCase()}`
      });
    }
  }

  // Intake events
  if (latestIntake) {
    if (latestIntake.status === 'IN_PROGRESS') {
      events.push({
        stage: 'INTAKE_IN_PROGRESS',
        label: 'Intake Started',
        date: latestIntake.startedAt || latestIntake.updatedAt,
        detail: 'Client began answering intake questions'
      });
    }

    if (latestIntake.submittedAt) {
      events.push({
        stage: 'INTAKE_COMPLETE',
        label: 'Intake Completed',
        date: latestIntake.submittedAt,
        detail: 'All intake questions answered'
      });
    }
  }

  // Assessment events
  if (latestAssessment) {
    events.push({
      stage: 'ASSESSMENT_IN_PROGRESS',
      label: 'Assessment Started',
      date: latestAssessment.startedAt || latestAssessment.updatedAt,
      detail: 'Risk assessment began'
    });

    if (latestAssessment.completedAt) {
      const score = latestAssessment.scores[0]?.score;
      events.push({
        stage: 'ASSESSMENT_COMPLETE',
        label: 'Assessment Completed',
        date: latestAssessment.completedAt,
        detail: score ? `Risk score: ${score}` : 'Assessment finished'
      });
    }
  }

  // Sort timeline chronologically
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Build document counts for stage computation
  const docCounts = documentRequirements.reduce(
    (acc, req) => {
      if (req.fulfilled) acc.fulfilled++;
      else acc.required++;
      return acc;
    },
    { required: 0, fulfilled: 0 }
  );

  const intakeWaived = assignment.intakeWaivedAt != null;
  const intakeForStageDetail =
    latestIntake != null
      ? {
          status: latestIntake.status,
          updatedAt: latestIntake.updatedAt,
          submittedAt: latestIntake.submittedAt,
          waived: intakeWaived,
        }
      : intakeWaived
        ? {
            status: "NOT_STARTED" as const,
            updatedAt: assignment.assignedAt,
            submittedAt: null as Date | null,
            waived: true as const,
          }
        : undefined;

  // Compute current stage and build pipeline client
  const stage = computeClientStage({
    invitation: invitation ? {
      status: invitation.status,
      statusUpdatedAt: invitation.statusUpdatedAt,
    } : undefined,
    intake: intakeForStageDetail,
    assessment: latestAssessment ? {
      status: latestAssessment.status,
      completedAt: latestAssessment.completedAt,
      updatedAt: latestAssessment.updatedAt,
    } : undefined,
    documents: docCounts
  });

  // Get most recent activity
  const activityDates = [
    assignment.assignedAt,
    invitation?.statusUpdatedAt,
    latestIntake?.updatedAt,
    latestAssessment?.updatedAt || latestAssessment?.completedAt,
  ].filter(Boolean) as Date[];

  const lastActivity = activityDates.length > 0
    ? new Date(Math.max(...activityDates.map(d => d.getTime())))
    : assignment.assignedAt;

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
    intake: latestIntake
      ? {
          status: latestIntake.status,
          responseCount: await prisma.intakeResponse.count({
            where: whereIntakeResponseHasAnswer(latestIntake.id),
          }),
          submittedAt: latestIntake.submittedAt,
          waivedAt: assignment.intakeWaivedAt,
        }
      : intakeWaived
        ? {
            status: "NOT_STARTED",
            responseCount: 0,
            submittedAt: null,
            waivedAt: assignment.intakeWaivedAt,
          }
        : null,
    assessment: latestAssessment ? {
      status: latestAssessment.status,
      completedAt: latestAssessment.completedAt,
      score: latestAssessment.scores[0]?.score || null,
    } : null,
    documents: {
      required: docCounts.required,
      fulfilled: docCounts.fulfilled,
    }
  };

  // Build intake details
  let intakeDetails = null;
  if (latestIntake) {
    // Count questions based on responses since there's no template-based system
    const totalResponses = await prisma.intakeResponse.count({
      where: { interviewId: latestIntake.id }
    });

    const responseCount = await prisma.intakeResponse.count({
      where: whereIntakeResponseHasAnswer(latestIntake.id),
    });

    intakeDetails = {
      interviewId: latestIntake.id,
      status: latestIntake.status,
      responseCount,
      totalQuestions: totalResponses, // Use total response slots as proxy for questions
      submittedAt: latestIntake.submittedAt,
    };
  }

  // Build assessment details
  let assessmentDetails = null;
  if (latestAssessment && latestAssessment.scores[0]) {
    const score = latestAssessment.scores[0];

    // Get all pillar scores for this assessment
    const pillarScores = await prisma.pillarScore.findMany({
      where: { assessmentId: latestAssessment.id },
      orderBy: { pillar: 'asc' }
    });

    assessmentDetails = {
      status: latestAssessment.status,
      score: score.score,
      riskLevel: score.riskLevel,
      completedAt: latestAssessment.completedAt,
      pillarScores: pillarScores.map((pillar) => ({
        pillar: pillar.pillar,
        score: pillar.score,
        riskLevel: pillar.riskLevel,
      })),
    };
  } else if (latestAssessment) {
    assessmentDetails = {
      status: latestAssessment.status,
      score: null,
      riskLevel: null,
      completedAt: latestAssessment.completedAt,
      pillarScores: [],
    };
  }

  return {
    client: pipelineClient,
    advisorAssignment: {
      id: assignment.id,
      intakeWaivedAt: assignment.intakeWaivedAt,
    },
    timeline: events,
    documentRequirements: documentRequirements.map(req => ({
      id: req.id,
      name: req.name,
      description: req.description,
      required: req.required,
      fulfilled: req.fulfilled,
      fulfilledAt: req.fulfilledAt,
      createdAt: req.createdAt,
      fileName: req.fileName,
      fileSize: req.fileSize,
    })),
    intakeDetails,
    assessmentDetails,
  };
}