import { z } from "zod";

export const updateServiceSchema = z.object({
    serviceId: z.string(),
    data: z.object({
        name: z.string().optional(),
        price: z.number().optional(),
    }),
});

export type UpdateServiceRequestParams = z.infer<typeof updateServiceSchema>;