import { z } from "zod";

export const listUserOrganizationRequestQuerySchema = z.object({
    organizationId:z.string(),
    username: z.string().optional()
})

export type ListUserOrganizationRequestQuerySchema = z.infer<typeof listUserOrganizationRequestQuerySchema>;

