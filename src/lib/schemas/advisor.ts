import { z } from 'zod';

// Schema for assigning a client to an advisor
export const assignClientSchema = z.object({
  clientId: z.string().cuid(),
  advisorId: z.string().cuid(),
});

// Schema for approving a client's intake with focus areas selection
export const approveClientSchema = z.object({
  interviewId: z.string().cuid(),
  focusAreas: z.array(z.string()).min(1, "Select at least one focus area"),
  notes: z.string().optional(),
});

// Schema for selecting risk areas during approval process
export const selectRiskAreasSchema = z.object({
  focusAreas: z.array(z.string()).min(1).max(8),
});

// Schema for updating approval status
export const updateApprovalStatusSchema = z.object({
  approvalId: z.string().cuid(),
  status: z.enum(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED']),
});

export type AssignClientInput = z.infer<typeof assignClientSchema>;
export type ApproveClientInput = z.infer<typeof approveClientSchema>;
export type SelectRiskAreasInput = z.infer<typeof selectRiskAreasSchema>;
export type UpdateApprovalStatusInput = z.infer<typeof updateApprovalStatusSchema>;