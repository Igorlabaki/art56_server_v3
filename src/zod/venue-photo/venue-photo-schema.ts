import { z } from "zod";

export const venuePhotoVenueIdSchema = z.object({
    venueId: z.string().trim().min(1, "Informe o espaco"),
});

export const updateVenuePhotoSchema = z.object({
    description: z
        .string()
        .trim()
        .max(191, "A descricao da foto deve ter no maximo 191 caracteres")
        .nullable()
        .optional()
        .transform((value) => {
            if (value === undefined || value === null) return null;
            return value.length > 0 ? value : null;
        }),
});

export const venuePhotoIdSchema = z.object({
    id: z.string().trim().min(1, "Informe a foto"),
});
