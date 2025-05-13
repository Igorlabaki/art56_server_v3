import { z } from "zod";

export const updatePasswordDbSchema = z.object({
 password: z.string(),
 userId: z.string(),
});

export type UpdatePasswordDbSchema = z.infer<typeof updatePasswordDbSchema>; 