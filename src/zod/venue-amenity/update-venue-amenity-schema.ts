import { z } from "zod";
import { nameSchema } from "./create-venue-amenity-schema";

export const updateVenueAmenitySchema = z.object({
    amenityId: z.string().min(1),
    name: nameSchema,
    position: z.number().int().min(0, "Posicao deve ser maior ou igual a zero").optional(),
});

export type UpdateVenueAmenityParams = z.infer<typeof updateVenueAmenitySchema>;
