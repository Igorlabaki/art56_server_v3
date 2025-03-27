import { z } from "zod";

export const updateContractSchema = z.object({
    title: z.string(),
    name: z.string(),
    contractId: z.string(),
    venueIds: z.array(z.string()),
    clauses: z.array(z.object({
        text: z.string(),
        title: z.string(),
        position: z.number(),
        id:z.string().optional(),
    })),
});

export type UpdateContractRequestParams = z.infer<typeof updateContractSchema>;