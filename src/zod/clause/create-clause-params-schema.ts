import { z } from "zod";

export const createClauseSchema = z.object({
    text: z.string(),
    title: z.string(),
    organizationId: z.string(),
});

export type CreateClauseRequestParams = z.infer<typeof createClauseSchema>;