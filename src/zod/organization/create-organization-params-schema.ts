import { z } from "zod";

export const createOrganizationSchema = z.object({
    name: z.string(),
    userId: z.string()
});

export type CreateOrganizationRequestParams = z.infer<typeof createOrganizationSchema>;