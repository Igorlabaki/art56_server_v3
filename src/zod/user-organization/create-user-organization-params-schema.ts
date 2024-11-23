import { z } from "zod";

export const createUserOrganizationSchema = z.object({
    userId: z.string(),
    organizationId: z.string()
});

export type CreateUserOrganizationRequestParams = z.infer<typeof createUserOrganizationSchema>;