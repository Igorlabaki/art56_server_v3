import { z } from "zod";

export const listOrganizationQuerySchema = z.object({
    userId: z.string(),
    name: z.string().optional(),
});

export type ListOrganizationQuerySchema = z.infer<typeof listOrganizationQuerySchema>;