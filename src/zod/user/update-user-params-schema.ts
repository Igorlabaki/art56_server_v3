import { z } from "zod";

export const updateUserSchema = z.object({
    userId: z.string(),
    name: z.string().optional(),
    email: z.string().optional(),
    username: z.string().optional(),
    avatarUrl: z.string().optional(),
});

export type UpdateUserRequestParams = z.infer<typeof updateUserSchema>;

