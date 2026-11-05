import { ContactKind } from "./partner-category";

export const PARTNER_DESCRIPTION_MAX = 400;

export type DescriptionDecision =
    | { ok: true; description?: string | null }
    | { ok: false; message: string };

function trimmedDescription(value: unknown): DescriptionDecision {
    if (value === undefined) return { ok: true };
    if (value === null) return { ok: true, description: null };
    if (typeof value !== "string") {
        return { ok: false, message: "Descricao invalida" };
    }
    const text = value.trim();
    if (!text) return { ok: true, description: null };
    if (text.length > PARTNER_DESCRIPTION_MAX) {
        return { ok: false, message: "A descricao passa de 400 caracteres" };
    }
    return { ok: true, description: text };
}

export function resolvePartnerDescription(
    mode: "create" | "update",
    type: ContactKind | undefined,
    description: unknown
): DescriptionDecision {
    const effective = mode === "create" ? (type ?? "TEAM_MEMBER") : type;
    const parsed = trimmedDescription(description);
    if (!parsed.ok) return parsed;

    if (effective === "TEAM_MEMBER") {
        if (mode === "create") {
            if (parsed.description) {
                return { ok: false, message: "Membro da equipe nao tem logo nem descricao" };
            }
            return { ok: true };
        }
        return { ok: true, description: null };
    }

    if (!("description" in parsed)) return { ok: true };
    return { ok: true, description: parsed.description };
}

type DescriptionFields = {
    type?: ContactKind;
    description?: unknown;
};

export function applyPartnerDescription<T extends DescriptionFields>(
    mode: "create" | "update",
    value: T
): T {
    const decision = resolvePartnerDescription(mode, value.type, value.description);
    if (!decision.ok || !("description" in decision)) {
        const rest = { ...value };
        delete rest.description;
        return rest;
    }
    return { ...value, description: decision.description };
}
