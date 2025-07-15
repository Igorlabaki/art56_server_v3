import { z } from "zod";

export const listUserOrganizationByOrganizationRequestQuerySchema = z.object({
    organizationId:z.string(),
    username: z.string().optional(),
    venueId: z.string().optional(),
})

export type ListUserOrganizationByOrganizationRequestQuerySchema = z.infer<typeof listUserOrganizationByOrganizationRequestQuerySchema>;

