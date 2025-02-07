import { z } from "zod";

export const listOwnerQuerySchema = z.object({
    organizationId: z.string(),
    completeName: z.string().optional(),
});

export type ListOwnerQuerySchema = z.infer<typeof listOwnerQuerySchema>;