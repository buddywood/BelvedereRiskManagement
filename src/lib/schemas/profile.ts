import { z } from 'zod';

// Constants matching enum values (lowercase for forms, uppercase for DB)
export const familyRelationship = ['spouse', 'child', 'parent', 'sibling', 'grandchild', 'grandparent', 'other'] as const;
export const governanceRole = ['decision_maker', 'advisor', 'successor', 'beneficiary', 'trustee', 'executor', 'other'] as const;

// Zod schema for creating household members
export const householdMemberSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name must be 100 characters or less'),
  age: z.number().int().min(0).max(150).optional(),
  occupation: z.string().max(100, 'Occupation must be 100 characters or less').optional(),
  phone: z.string().max(20, 'Phone number must be 20 characters or less').optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  relationship: z.enum(['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDCHILD', 'GRANDPARENT', 'OTHER']),
  governanceRoles: z.array(z.enum(['DECISION_MAKER', 'ADVISOR', 'SUCCESSOR', 'BENEFICIARY', 'TRUSTEE', 'EXECUTOR', 'OTHER'])).default([]),
  isResident: z.boolean().default(true),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

// Schema for updating household members (partial except for required fields)
export const updateHouseholdMemberSchema = householdMemberSchema.partial().required({
  fullName: true,
  relationship: true
});

// Type inference
export type HouseholdMemberFormData = z.infer<typeof householdMemberSchema>;

// Human-readable labels for relationships
export const RELATIONSHIP_LABELS: Record<string, string> = {
  SPOUSE: 'Spouse',
  CHILD: 'Child',
  PARENT: 'Parent',
  SIBLING: 'Sibling',
  GRANDCHILD: 'Grandchild',
  GRANDPARENT: 'Grandparent',
  OTHER: 'Other',
};

// Human-readable labels for governance roles
export const GOVERNANCE_ROLE_LABELS: Record<string, string> = {
  DECISION_MAKER: 'Decision Maker',
  ADVISOR: 'Advisor',
  SUCCESSOR: 'Successor',
  BENEFICIARY: 'Beneficiary',
  TRUSTEE: 'Trustee',
  EXECUTOR: 'Executor',
  OTHER: 'Other',
};