import { z } from "zod";

export const nameSchema = z
    .string()
    .trim()
    .min(1, "Informe o nome da caracteristica")
    .max(120, "Nome da caracteristica deve ter no maximo 120 caracteres");

export const createVenueAmenitySchema = z.object({
    venueId: z.string().min(1),
    name: nameSchema,
});

export type CreateVenueAmenityParams = z.infer<typeof createVenueAmenitySchema>;
