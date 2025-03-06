import { z } from "zod";

export const createUserOrganizationSchema = z.object({
    userId: z.string(),
    organizationId: z.string(),
    permissions: z.array(z.string()),
    role: z.enum(["ADMIN", "USER"]),
});

export type CreateUserOrganizationRequestParams = z.infer<typeof createUserOrganizationSchema>;