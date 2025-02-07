import { z } from "zod";

export const createPersonSchema = z.object({
    name: z.string(),
    proposalId: z.string(),
    rg: z.string().optional(),
    email: z.string().optional(),
    userId: z.string().optional(),
    username: z.string().optional(),
    type: z.enum(["WORKER","GUEST"]),
});

export type CreatePersonRequestParams = z.infer<typeof createPersonSchema>;