import { z } from "zod";

export const createImageOrganizationRequestParams = z.object({
  organizationId: z.string(),
  description: z.string(),
  tag: z.string().nullable(), // Opcional inicialmente
  imageUrl: z.string().optional(),
  group: z.string().optional(),
  position: z.string().optional(),  // Opcional inicialmente
  responsiveMode: z.string().optional(), // Opcional inicialmente
})

export type CreateImageOrganizationRequestParams = z.infer<typeof createImageOrganizationRequestParams>;