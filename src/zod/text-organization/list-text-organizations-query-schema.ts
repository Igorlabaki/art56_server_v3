import { z } from "zod";

export const listTextOrganizationRequestQuerySchema = z.object({
    organizationId: z.string(),
    area: z.string().optional(),
})

export type ListTextOrganizationRequestQuerySchema = z.infer<typeof listTextOrganizationRequestQuerySchema>;

