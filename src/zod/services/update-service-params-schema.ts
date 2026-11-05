import { z } from "zod";

const description = z.string().max(500, "Descricao passa de 500 caracteres").optional().nullable()
    .transform((value) => {
        if (value === undefined) return undefined;
        if (value == null) return null;
        const trimmed = value.trim();
        return trimmed.length ? trimmed : null;
    });

export const updateServiceSchema = z.object({
    serviceId: z.string(),
    data: z.object({
        name: z.string().min(1).optional(),
        price: z.coerce.number().min(0, "Preco do servico nao pode ser negativo").optional(),
        pricingType: z.enum(["FIXED", "PER_HOUR", "PER_PERSON"]).optional(),
        description,
        rpaRequired: z.preprocess((value) => {
            if (value == null || value === "") return undefined;
            return value === true || value === "true";
        }, z.boolean().optional()),
        rpaMinPeople: z.preprocess(
            (value) => (value === "" || value == null ? undefined : value),
            z.coerce.number().optional(),
        ),
        imageUrl: z.string().optional().nullable(),
        removeImage: z.preprocess((value) => value === true || value === "true", z.boolean()).optional(),
    }),
});

export type UpdateServiceRequestParams = z.infer<typeof updateServiceSchema>;
