import { z } from "zod";

export const createImageOrganizationDbParams = z.object({
  organizationId: z.string(),
  imageUrl: z.string(),
  group: z.string().optional(),
  description: z.string(),
  tag: z.string().nullable(), // Opcional inicialmente
  position: z.string().optional(),  // Opcional inicialmente
  responsiveMode: z.string().optional(), // Opcional inicialmente
})

export type CreateImageOrganizationDbParams = z.infer<typeof createImageOrganizationDbParams>;