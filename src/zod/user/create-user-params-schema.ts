import { z } from "zod";

export const createUserSchema = z.object({
    email: z.string(),
    username: z.string(),
    password: z.string(),
});

export type CreateUserRequestParams = z.infer<typeof createUserSchema>;

