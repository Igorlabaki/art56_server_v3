import { z } from "zod";

export const createImageRequestParams = z.object({
  venueId: z.string(),
  imageUrl: z.string(),
  description: z.string(),
  tag: z.string().nullable(), // Opcional inicialmente
  position: z.string().optional(),  // Opcional inicialmente
  responsiveMode: z.string().optional(), // Opcional inicialmente
})

export type CreateImageRequestParams = z.infer<typeof createImageRequestParams>;