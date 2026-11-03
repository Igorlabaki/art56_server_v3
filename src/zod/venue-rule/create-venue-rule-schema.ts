import { z } from "zod";

const titleSchema = z
    .string()
    .trim()
    .max(120, "Titulo da regra deve ter no maximo 120 caracteres")
    .nullish()
    .transform((value) => (value ? value : null));

export const createVenueRuleSchema = z.object({
    venueId: z.string().min(1),
    title: titleSchema,
    text: z
        .string()
        .trim()
        .min(1, "Informe o texto da regra")
        .max(5000, "Texto da regra deve ter no maximo 5000 caracteres"),
});

export type CreateVenueRuleParams = z.infer<typeof createVenueRuleSchema>;
