import { z } from "zod";

export const listUserOrganizationRequestQuerySchema = z.object({
    userId:z.string(),
})

export type ListUserOrganizationRequestQuerySchema = z.infer<typeof listUserOrganizationRequestQuerySchema>;

