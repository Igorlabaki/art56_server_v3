import { z } from "zod";

export const getByTagImageOrganizationRequestQuerySchema = z.object({
    organizationId: z.string(),
    tag: z.string().optional(),
    responsiveMode: z.string().optional(),
})

export type GetByTagImageOrganizationRequestQuerySchema = z.infer<typeof getByTagImageOrganizationRequestQuerySchema>;

