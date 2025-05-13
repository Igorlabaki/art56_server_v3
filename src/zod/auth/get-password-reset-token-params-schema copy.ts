import { z } from "zod";

export const getByPasswordResetToken = z.object({
    token: z.string(),
});

export type GetByPasswordResetToken = z.infer<typeof getByPasswordResetToken>;

