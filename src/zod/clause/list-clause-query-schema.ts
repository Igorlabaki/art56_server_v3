import { z } from "zod";

export const listClauseRequestQuerySchema = z.object({
    organizationId: z.string(),
    title: z.string().optional(),
})

export type ListClauseRequestQuerySchema = z.infer<typeof listClauseRequestQuerySchema>;

