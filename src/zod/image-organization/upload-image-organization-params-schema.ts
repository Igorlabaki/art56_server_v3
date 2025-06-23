import { z } from "zod";

export const updateImageOrganizationRequestParams = z.object({
  imageId: z.string(),
  organizationId: z.string(),
  description: z.string(),
  tag: z.string().nullable(), // Opcional inicialmente
  imageUrl: z.string().optional(),
  position: z.string().optional(),  // Opcional inicialmente
  responsiveMode: z.string().optional(), // Opcional inicialmente
  group: z.string().optional(),
})

export type UpdateImageOrganizationRequestParams = z.infer<typeof updateImageOrganizationRequestParams>;