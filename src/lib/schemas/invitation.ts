import { z } from "zod";

export const createInvitationSchema = z.object({
  clientEmail: z.string().email("Valid email required"),
  clientName: z.string().max(100).optional(),
  personalMessage: z
    .string()
    .max(2000, "Message too long")
    .optional()
    .default(
      "I'd like to invite you to complete a family governance assessment. This confidential process will help us identify areas where your family's wealth management governance can be strengthened."
    ),
  intakeWaived: z.boolean().optional().default(false),
});

export type CreateInvitationData = z.infer<typeof createInvitationSchema>;