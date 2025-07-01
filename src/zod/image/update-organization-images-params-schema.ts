import { z } from "zod";

export const updateImageRequestParams = z.object({
  organizationId: z.string(),
  description: z.string(),
  tag: z.string().nullable(), // Opcional inicialmente
  imageUrls: z.array(z.string()).optional(),
  position: z.string().optional(),  // Opcional inicialmente
  responsiveMode: z.string().optional(), // Opcional inicialmente
  group: z.string().optional(),
})

export type UpdateImageRequestParams = z.infer<typeof updateImageRequestParams>;

// Update Image Organization
