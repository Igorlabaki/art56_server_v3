import { z } from "zod";

export const listUserRequestQuerySchema = z.object({
    email: z.string().email(),
    organizationId: z.string(),
})

export type ListUserRequestQuerySchema = z.infer<typeof listUserRequestQuerySchema>;

