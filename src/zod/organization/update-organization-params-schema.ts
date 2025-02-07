import { z } from "zod";

export const updateOrganizationSchema = z.object({
    organizationId: z.string(),
    data: z.object({
        name: z.string().optional()
    }),
});

export type UpdateOrganizationSchema = z.infer<typeof updateOrganizationSchema>;