import { z } from "zod";
import { descriptionSchema, nameSchema, videoUrlSchema } from "./create-venue-amenity-schema";

export const updateVenueAmenitySchema = z.object({
    amenityId: z.string().min(1),
    name: nameSchema,
    position: z.number().int().min(0, "Posicao deve ser maior ou igual a zero").optional(),
    description: descriptionSchema,
    videoUrl: videoUrlSchema,
    removeImage: z.preprocess((value) => value === true || value === "true", z.boolean()).optional(),
});

export type UpdateVenueAmenityParams = z.infer<typeof updateVenueAmenitySchema>;
