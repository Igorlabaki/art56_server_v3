import { z } from "zod";

export const recalculatePublicProposalBodySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    guestNumber: z.number().int().min(1),
    hours: z.number().int().min(1).max(24),
});

export type RecalculatePublicProposalBody = z.infer<typeof recalculatePublicProposalBodySchema>;
