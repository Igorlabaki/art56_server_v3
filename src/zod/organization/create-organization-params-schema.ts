import { z } from "zod";

export const createOrganizationSchema = z.object({
    name: z.string(),
    userId: z.string(),
    email: z.string().email().optional(),
    url: z.string().url().optional(),
    facebookUrl: z.string().url().optional(),
    instagramUrl: z.string().url().optional(),
    whatsappNumber: z.string().optional(),
    tiktokUrl: z.string().url().optional(),
    logoUrl: z.string().url().optional(),
});

export type CreateOrganizationRequestParams = z.infer<typeof createOrganizationSchema>;