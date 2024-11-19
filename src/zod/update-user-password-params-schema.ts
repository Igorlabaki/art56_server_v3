import { z } from "zod";

export const updateUserPasswordSchema = z.object({
    password: z.string(),
    email: z.string().email(),
});

export type UpdateUserPasswordRequestParams = z.infer<typeof updateUserPasswordSchema>;