import { ClientWorkflowStage, InvitationStatus } from '@prisma/client';

// Re-export for convenience
export { ClientWorkflowStage } from '@prisma/client';

// Single client in the pipeline view
export type PipelineClient = {
  id: string;              // User.id
  name: string | null;
  email: string;
  assignedAt: Date;
  stage: ClientWorkflowStage;
  progress: number;        // 0-100 percentage
  lastActivity: Date;      // Most recent status change
  // Invitation data (if exists)
  invitation: {
    status: InvitationStatus;
    sentAt: Date;
    code: string;
  } | null;
  // Intake data (if exists)
  intake: {
    status: string;
    responseCount: number;
    submittedAt: Date | null;
  } | null;
  // Assessment data (if exists)
  assessment: {
    status: string;
    completedAt: Date | null;
    score: number | null;
  } | null;
  // Document tracking
  documents: {
    required: number;
    fulfilled: number;
  };
};

// Summary metrics for the pipeline dashboard
export type PipelineMetrics = {
  total: number;
  byStage: Record<ClientWorkflowStage, number>;
  documentsNeeded: number;  // clients with unfulfilled document requirements
  stalled: number;          // clients with no activity in 7+ days
};

// Filter options for pipeline table
export type PipelineFilters = {
  stage?: ClientWorkflowStage;
  search?: string;
  sortBy?: 'name' | 'stage' | 'progress' | 'lastActivity';
  sortDir?: 'asc' | 'desc';
};