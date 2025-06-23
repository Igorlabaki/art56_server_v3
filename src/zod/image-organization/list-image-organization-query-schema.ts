import { z } from "zod";

export const listImageOrganizationRequestQuerySchema = z.object({
    organizationId: z.string(),
    responsiveMode: z.string().optional(),
    description: z.string().optional(),
})

export type ListImageOrganizationRequestQuerySchema = z.infer<typeof listImageOrganizationRequestQuerySchema>;

