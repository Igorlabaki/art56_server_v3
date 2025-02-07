import { z } from "zod";

export const updatePersonSchema = z.object({
    personId: z.string(),
    data: z.object({
        rg: z.string().optional(),
        name: z.string().optional(),
        email: z.string().optional(),
        attendance: z.boolean().optional(),
        type: z.enum(["GUEST","WORKER"]).optional(),
    }),
});

export type UpdatePersonRequestParams = z.infer<typeof updatePersonSchema>;