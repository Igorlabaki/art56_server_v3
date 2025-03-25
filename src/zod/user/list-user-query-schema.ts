import { z } from "zod";

export const listUserRequestQuerySchema = z.object({
    email: z.string().optional(),
    organizationId: z.string().optional(),
})

export type ListUserRequestQuerySchema = z.infer<typeof listUserRequestQuerySchema>;

