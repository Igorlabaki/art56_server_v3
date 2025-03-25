import { z } from "zod";

export const getByIdUserOrganizationSchema = z.object({
    userOrganizationId: z.string(),
});

export type GetByIdUserOrganizationSchema = z.infer<typeof getByIdUserOrganizationSchema>;