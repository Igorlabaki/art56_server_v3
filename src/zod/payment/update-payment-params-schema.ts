import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

export const updatePaymentSchema = z.object({
    userId:z.string(),
    username:z.string(),
    paymentId: z.string(),
    proposalId:z.string(),
    data: z.object({
        amount: z.number(),
        paymentDate: z.string(),
        imageUrl: z.string().optional(),
        paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    }),
});

export type UpdatePaymentRequestParams = z.infer<typeof updatePaymentSchema>;