import { describe, expect, it } from "vitest";
import { createContactSchema } from "./create-contact-params-schema";
import { resolvePartnerCategory } from "./partner-category";
import { updateContactSchema } from "./update-contact-params-schema";

const base = {
    name: "Casa Doce",
    role: "Buffet da casa",
    venueId: "venue-1",
    whatsapp: "11999999999",
};

describe("resolvePartnerCategory", () => {
    it("exige categoria da lista para fornecedor", () => {
        expect(resolvePartnerCategory("create", "SUPPLIER", undefined).ok).toBe(false);
        expect(resolvePartnerCategory("create", "SUPPLIER", "NOPE").ok).toBe(false);
        expect(resolvePartnerCategory("create", "SUPPLIER", "OUTROS")).toEqual({ ok: true, category: "OUTROS" });
    });

    it("equipe nova nao leva categoria e a atualizacao zera", () => {
        expect(resolvePartnerCategory("create", undefined, undefined)).toEqual({ ok: true });
        expect(resolvePartnerCategory("create", "TEAM_MEMBER", "BAR").ok).toBe(false);
        expect(resolvePartnerCategory("update", "TEAM_MEMBER", "BAR")).toEqual({ ok: true, category: null });
    });

    it("update sem tipo nao exige categoria e aceita um valor da lista", () => {
        expect(resolvePartnerCategory("update", undefined, undefined)).toEqual({ ok: true });
        expect(resolvePartnerCategory("update", undefined, "DJ")).toEqual({ ok: true, category: "DJ" });
        expect(resolvePartnerCategory("update", "SUPPLIER", undefined).ok).toBe(false);
    });
});

describe("schemas de contato", () => {
    it("create de fornecedor grava OUTROS e recusa categoria ausente ou estranha", () => {
        expect(createContactSchema.safeParse({ ...base, type: "SUPPLIER" }).success).toBe(false);
        expect(createContactSchema.safeParse({ ...base, type: "SUPPLIER", category: "NOPE" }).success).toBe(false);
        const parsed = createContactSchema.parse({ ...base, type: "SUPPLIER", category: "OUTROS" });
        expect(parsed.category).toBe("OUTROS");
        expect(parsed.role).toBe("Buffet da casa");
    });

    it("create de equipe passa sem categoria e recusa categoria enviada", () => {
        const created = createContactSchema.parse(base);
        expect(created.category).toBeUndefined();
        expect(createContactSchema.parse({ ...base, type: "TEAM_MEMBER" }).category).toBeUndefined();
        expect(createContactSchema.safeParse({ ...base, category: "BAR" }).success).toBe(false);
    });

    it("update para equipe zera a categoria e fornecedor sem categoria falha", () => {
        const updated = updateContactSchema.parse({
            contactId: "contact-1",
            data: { type: "TEAM_MEMBER", category: "BAR", role: "Recepcao" },
        });
        expect(updated.data.category).toBeNull();
        expect(updated.data.role).toBe("Recepcao");
        expect(updateContactSchema.safeParse({ contactId: "contact-1", data: { type: "SUPPLIER" } }).success).toBe(false);
    });

    it("update sem tipo e sem categoria nao mexe na categoria", () => {
        const updated = updateContactSchema.parse({ contactId: "contact-1", data: { name: "Novo" } });
        expect(updated.data.category).toBeUndefined();
        expect(updated.data.name).toBe("Novo");
    });

    it("fornecedor grava descricao curta, descarta logoUrl e zera texto vazio", () => {
        const parsed = createContactSchema.parse({
            ...base,
            type: "SUPPLIER",
            category: "OUTROS",
            description: "  Bolos finos  ",
            logoUrl: "https://evil.example/logo.png",
        });
        expect(parsed.description).toBe("Bolos finos");
        expect(parsed).not.toHaveProperty("logoUrl");

        const empty = createContactSchema.parse({
            ...base,
            type: "SUPPLIER",
            category: "OUTROS",
            description: "   ",
        });
        expect(empty.description).toBeNull();
    });

    it("descricao acima de 400 caracteres falha", () => {
        const result = createContactSchema.safeParse({
            ...base,
            type: "SUPPLIER",
            category: "OUTROS",
            description: "a".repeat(401),
        });
        expect(result.success).toBe(false);
    });

    it("equipe nova nao leva descricao e a atualizacao zera", () => {
        expect(createContactSchema.safeParse({ ...base, description: "Buffet" }).success).toBe(false);
        expect(createContactSchema.safeParse({ ...base, type: "TEAM_MEMBER", description: "Buffet" }).success).toBe(false);
        const updated = updateContactSchema.parse({
            contactId: "contact-1",
            data: { type: "TEAM_MEMBER", description: "ainda aqui", logoUrl: "https://evil.example/a.png" },
        });
        expect(updated.data.description).toBeNull();
        expect(updated.data).not.toHaveProperty("logoUrl");
    });

    it("update sem tipo preserva a descricao enviada e ignora logoUrl", () => {
        const updated = updateContactSchema.parse({
            contactId: "contact-1",
            data: { description: "  Doces  ", logoUrl: "https://evil.example/a.png" },
        });
        expect(updated.data.description).toBe("Doces");
        expect(updated.data).not.toHaveProperty("logoUrl");
    });
});
