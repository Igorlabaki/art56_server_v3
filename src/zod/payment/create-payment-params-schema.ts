import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

export const createPaymentSchema = z.object({
    amount: z.number(),
    userId: z.string(),
    venueId: z.string(),
    username: z.string(),
    proposalId: z.string(),
    paymentDate: z.string(),
    imageUrl: z.string().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod),
});

export type CreatePaymentRequestParams = z.infer<typeof createPaymentSchema>;