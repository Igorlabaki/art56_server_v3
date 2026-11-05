import { z } from "zod";

const description = z.string().max(500, "Descricao passa de 500 caracteres").optional().nullable()
    .transform((value) => {
        if (value == null) return null;
        const trimmed = value.trim();
        return trimmed.length ? trimmed : null;
    });

export const createServiceSchema = z.object({
    name: z.string().min(1),
    price: z.coerce.number().min(0, "Preco do servico nao pode ser negativo"),
    pricingType: z.enum(["FIXED", "PER_HOUR", "PER_PERSON"]).optional().default("FIXED"),
    description,
    imageUrl: z.string().optional().nullable(),
    venueId: z.string(),
    rpaRequired: z.preprocess((value) => value === true || value === "true", z.boolean()).optional().default(false),
    rpaMinPeople: z.preprocess(
        (value) => (value === "" || value == null ? undefined : value),
        z.coerce.number().optional(),
    ),
});

export type CreateServiceRequestParams = z.infer<typeof createServiceSchema>;
