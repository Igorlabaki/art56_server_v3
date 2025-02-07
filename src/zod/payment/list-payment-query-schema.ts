import { z } from "zod";

export const listPaymentRequestQuerySchema = z.object({
    venueId: z.string(),
    proposalId: z.string().optional(),
})

export type ListPaymentRequestQuerySchema = z.infer<typeof listPaymentRequestQuerySchema>;

