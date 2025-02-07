import { z } from "zod";

export const deleteOrganizationSchema = z.object({
    organizationId: z.string(),
});

export type DeleteOrganizationSchema = z.infer<typeof deleteOrganizationSchema>;