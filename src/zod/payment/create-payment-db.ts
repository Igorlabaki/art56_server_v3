import { z } from "zod";

export const createPaymentInDb = z.object({
    amount: z.number(),
    venueId: z.string(),
    proposalId: z.string(),
    paymentDate: z.date(),
});

export type CreatePaymentInDb = z.infer<typeof createPaymentInDb>;