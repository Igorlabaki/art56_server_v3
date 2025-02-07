import { z } from "zod";

export const refreshTokenSchema = z.object({
    accessToken: z.string(),
});

export type RefreshTokenRequestParams = z.infer<typeof refreshTokenSchema>;