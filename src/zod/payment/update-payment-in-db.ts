import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

export const updatePaymentIndBSchema = z.object({
    paymentId: z.string(),
    data: z.object({
        amount: z.string(),
        paymentDate: z.date(),
        imageUrl: z.string().optional(),
        paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    }),
});

export type UpdatePaymentIndBSchema = z.infer<typeof updatePaymentIndBSchema>;