import { z } from "zod";
import { isYoutubeUrl } from "../venue/tour-video-url-schema";

export const AMENITY_VIDEO_URL_MESSAGE = "Use um link do YouTube.";

export const nameSchema = z
    .string()
    .trim()
    .min(1, "Informe o nome da caracteristica")
    .max(120, "Nome da caracteristica deve ter no maximo 120 caracteres");

export const descriptionSchema = z
    .string()
    .trim()
    .max(500, "Descricao da caracteristica deve ter no maximo 500 caracteres")
    .nullable()
    .optional()
    .transform((value) => {
        if (value === undefined) return undefined;
        return value ? value : null;
    });

export const videoUrlSchema = z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z
        .union([
            z.literal("").transform(() => null),
            z.null(),
            z.string().refine(isYoutubeUrl, { message: AMENITY_VIDEO_URL_MESSAGE }),
        ])
        .optional(),
);

export const createVenueAmenitySchema = z.object({
    venueId: z.string().min(1),
    name: nameSchema,
    description: descriptionSchema,
    videoUrl: videoUrlSchema,
});

export type CreateVenueAmenityParams = z.infer<typeof createVenueAmenitySchema>;
