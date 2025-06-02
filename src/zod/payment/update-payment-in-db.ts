import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

export const updatePaymentIndBSchema = z.object({
    paymentId: z.string(),
    amount: z.number(),
    paymentDate: z.date(),
    imageUrl: z.string().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
});

export type UpdatePaymentIndBSchema = z.infer<typeof updatePaymentIndBSchema>;