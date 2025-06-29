import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

export const createPaymentInDb = z.object({
    amount: z.number(),
    venueId: z.string(),
    paymentDate: z.date(),
    proposalId: z.string(),
    imageUrl: z.string().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
});

export type CreatePaymentInDb = z.infer<typeof createPaymentInDb>;