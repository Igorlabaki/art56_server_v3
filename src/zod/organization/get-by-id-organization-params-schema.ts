import { z } from "zod";

export const getByIdOrganizationSchema = z.object({
    organizationId: z.string(),
    venueName: z.string().optional(),
});

export type GetByIdOrganizationSchema = z.infer<typeof getByIdOrganizationSchema>;