import { z } from "zod";

export const listUserOrganizationRequestQuerySchema = z.object({
    userId:z.string().optional(),
    name: z.string().optional(),
})

export type ListUserOrganizationRequestQuerySchema = z.infer<typeof listUserOrganizationRequestQuerySchema>;

