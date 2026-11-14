import { z } from "zod";
import { descriptionSchema, nameSchema, videoUrlSchema } from "./create-venue-amenity-schema";

const imageRefSchema = z.union([
    z.object({ id: z.string().min(1) }).strict(),
    z.object({ newIndex: z.number().int().min(0) }).strict(),
]);

export const updateVenueAmenitySchema = z.object({
    amenityId: z.string().min(1),
    name: nameSchema,
    position: z.number().int().min(0, "Posicao deve ser maior ou igual a zero").optional(),
    description: descriptionSchema,
    videoUrl: videoUrlSchema,
    images: z.array(imageRefSchema).optional(),
});

export type UpdateVenueAmenityParams = z.infer<typeof updateVenueAmenitySchema>;
