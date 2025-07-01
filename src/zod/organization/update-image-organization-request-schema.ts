import { z } from "zod";

export const updateImageOrganizationRequestSchema = z.object({
    organizationId: z.string(),
    imageids: z.array(z.string()),
    venueId: z.string(),
});

export type UpdateImageOrganizationRequestSchema = z.infer<typeof updateImageOrganizationRequestSchema>;