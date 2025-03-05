import { z } from "zod";

export const updateImageRequestParams = z.object({
  imageId: z.string(),
  venueId: z.string(),
  imageUrl: z.string(),
  description: z.string(),
  tag: z.string().nullable(), // Opcional inicialmente
  position: z.string().optional(),  // Opcional inicialmente
  responsiveMode: z.string().optional(), // Opcional inicialmente
})

export type UpdateImageRequestParams = z.infer<typeof updateImageRequestParams>;