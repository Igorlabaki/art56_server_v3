import { z } from "zod";

export const updateUserPasswordSchema = z.object({
    password: z.string(),
    userId: z.string(),
});

export type UpdateUserPasswordRequestParams = z.infer<typeof updateUserPasswordSchema>;