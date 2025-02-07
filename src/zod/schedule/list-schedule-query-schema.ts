import { z } from "zod";

export const listScheduleRequestQuerySchema = z.object({
    proposalId: z.string(),
    name: z.string().optional(),
})

export type ListScheduleRequestQuerySchema = z.infer<typeof listScheduleRequestQuerySchema>;

