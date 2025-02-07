import { z } from "zod";

export const CreateSessionSchema = z.object({
    userId: z.string(),
    expiresAt: z.date(),
    refreshTokenId: z.string(),
});

export type CreateSessionRequestParams = z.infer<typeof CreateSessionSchema>;