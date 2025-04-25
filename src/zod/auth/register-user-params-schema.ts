import { z } from "zod";

export const RegisterUserSchema = z.object({
    email: z.string().email(),
    username: z.string(),
    password: z.string(),
    googleId: z.string().optional(),
    avatarUrl: z.string().optional(),
});

export type RegisterUserRequestParams = z.infer<typeof RegisterUserSchema>;