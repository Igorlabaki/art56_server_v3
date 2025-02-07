import { z } from "zod";

export const getSessionByUserIdSchema = z.object({
    userId: z.string()
});

export type GetSessionByUserIdRequestParams = z.infer<typeof getSessionByUserIdSchema>;