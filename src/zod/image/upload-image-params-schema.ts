import { z } from "zod";

export const updateImageRequestParams = z.object({
  imageId: z.string(),
  venueId: z.string(),
  description: z.string(),
  tag: z.string().nullable(), // Opcional inicialmente
  imageUrl: z.string().optional(),
  position: z.string().optional(),  // Opcional inicialmente
  responsiveMode: z.string().optional(), // Opcional inicialmente
})

export type UpdateImageRequestParams = z.infer<typeof updateImageRequestParams>;