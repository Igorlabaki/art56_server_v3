import { z } from "zod";

export const PARTNER_CATEGORIES = [
    "BUFFET",
    "CHURRASCO",
    "BAR",
    "DJ",
    "MUSICA_AO_VIVO",
    "FOTOGRAFIA",
    "FILMAGEM",
    "DECORACAO",
    "CENOGRAFIA",
    "BOLOS_DOCES",
    "RECREACAO",
    "ENTRETENIMENTO",
    "CERIMONIAL",
    "AUDIOVISUAL",
    "MOBILIARIO",
    "BRINDES",
    "OUTROS",
] as const;

export const partnerCategorySchema = z.enum(PARTNER_CATEGORIES);

export type PartnerCategory = z.infer<typeof partnerCategorySchema>;

export type ContactKind = "TEAM_MEMBER" | "SUPPLIER";

export type CategoryDecision =
    | { ok: true; category?: PartnerCategory | null }
    | { ok: false; message: string };

export function resolvePartnerCategory(
    mode: "create" | "update",
    type: ContactKind | undefined,
    category: unknown
): CategoryDecision {
    const effective = mode === "create" ? (type ?? "TEAM_MEMBER") : type;
    const parsed = partnerCategorySchema.safeParse(category);
    const hasValue = category !== undefined && category !== null && category !== "";

    if (effective === "SUPPLIER") {
        if (!parsed.success) {
            return { ok: false, message: "Selecione a categoria" };
        }
        return { ok: true, category: parsed.data };
    }

    if (effective === "TEAM_MEMBER") {
        if (mode === "create" && hasValue) {
            return { ok: false, message: "Membro da equipe nao tem categoria" };
        }
        if (mode === "update") {
            return { ok: true, category: null };
        }
        return { ok: true };
    }

    if (!hasValue) {
        return { ok: true };
    }
    if (!parsed.success) {
        return { ok: false, message: "Selecione a categoria" };
    }
    return { ok: true, category: parsed.data };
}

type CategoryFields = {
    type?: ContactKind;
    category?: unknown;
};

export function applyPartnerCategory<T extends CategoryFields>(
    mode: "create" | "update",
    value: T
): T {
    const decision = resolvePartnerCategory(mode, value.type, value.category);
    if (!decision.ok) {
        return value;
    }
    if (!("category" in decision)) {
        const rest = { ...value };
        delete rest.category;
        return rest;
    }
    return { ...value, category: decision.category };
}
