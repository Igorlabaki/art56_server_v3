import { z } from "zod";

export const updatePaymentIndBSchema = z.object({
    paymentId: z.string(),
    data: z.object({
        amount: z.number(),
        paymentDate: z.date(),
        imageUrl: z.string().optional(),
    }),
});

export type UpdatePaymentIndBSchema = z.infer<typeof updatePaymentIndBSchema>;