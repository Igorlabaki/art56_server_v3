import { z } from "zod";

export const updateOrganizationSchema = z.object({
    organizationId: z.string(),
    data: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        url: z.string().url().optional(),
        facebookUrl: z.string().url().optional(),
        instagramUrl: z.string().url().optional(),
        whatsappNumber: z.string().optional(),
        tiktokUrl: z.string().url().optional(),
        logoUrl: z.string().url().optional(),
    }),
});

export type UpdateOrganizationSchema = z.infer<typeof updateOrganizationSchema>;