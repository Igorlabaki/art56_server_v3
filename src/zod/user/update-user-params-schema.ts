import { z } from "zod";

export const updateUserSchema = z.object({
    userId: z.string(),
    name: z.string().optional(),
    email: z.string().optional(),
    googleId: z.string().optional(),
    username: z.string().optional(),
    avatarUrl: z.string().optional(),
    passwordResetToken: z.string().nullable().optional(),
    passwordResetExpires: z.string().nullable().optional(),
});

export type UpdateUserRequestParams = z.infer<typeof updateUserSchema>;

