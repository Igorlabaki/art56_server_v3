import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { createOrganizationOwnerSchema } from "../zod/owner/create-owner-params-schema";
import { createVenueOwnerSchema } from "../zod/owner/create-venue-owner-params-schema";
import { updateOwnerSchema } from "../zod/owner/update-owner-params-schema";
import {
    isCnpjFormat,
    normalizeCnpj,
    OWNER_CNPJ_FORMAT,
    OWNER_COMPANY_REQUIRED,
    OwnerDocumentFields,
    resolveOwnerData,
} from "./owner-document";

const pjWithSize: OwnerDocumentFields = {
    personType: "PJ",
    companyName: "Casa Azul Eventos",
    cnpj: "12ABC34501DE35",
    companySize: "MEI",
};

const pf: OwnerDocumentFields = { personType: "PF", companyName: null, cnpj: null, companySize: null };

const baseOwner = {
    cep: "01000-000",
    pix: "chave",
    cpf: "000",
    city: "Sao Paulo",
    state: "SP",
    street: "Rua A",
    bankName: "Banco",
    bankAgency: "0001",
    streetNumber: "10",
    completeName: "Fulano",
    neighborhood: "Centro",
    organizationId: "org-1",
    bankAccountNumber: "123",
};

function messageOf(fn: () => unknown) {
    try {
        fn();
    } catch (error) {
        return (error as Error).message;
    }
    return null;
}

describe("CNPJ do proprietario", () => {
    it("normaliza alfanumerico com e sem pontuacao", () => {
        expect(normalizeCnpj("12abc34501de35")).toBe("12ABC34501DE35");
        expect(normalizeCnpj("12.ABC.345/01DE-35")).toBe("12ABC34501DE35");
        expect(normalizeCnpj(" 12.abc.345/01de-35 ")).toBe("12ABC34501DE35");
    });

    it("aceita numerico e alfanumerico", () => {
        expect(isCnpjFormat("12.345.678/0001-95")).toBe(true);
        expect(isCnpjFormat("12.ABC.345/01DE-35")).toBe(true);
    });

    it("recusa letra no digito verificador, tamanho errado e simbolo", () => {
        expect(isCnpjFormat("12ABC34501DEA5")).toBe(false);
        expect(isCnpjFormat("12ABC34501DE3")).toBe(false);
        expect(isCnpjFormat("12ABC34501DE355")).toBe(false);
        expect(isCnpjFormat("12@BC34501DE35")).toBe(false);
        expect(messageOf(() => resolveOwnerData(null, { personType: "PJ", companyName: "X", cnpj: "12ABC34501DEA5" }))).toBe(OWNER_CNPJ_FORMAT);
    });
});

describe("resolveOwnerData na criacao", () => {
    it("sem personType vira PF e descarta campos de empresa enviados", () => {
        expect(resolveOwnerData(null, { companyName: "X", cnpj: "12ABC34501DE35", companySize: "ME" })).toEqual(pf);
    });

    it("PJ sem razao social ou sem CNPJ e recusada", () => {
        expect(messageOf(() => resolveOwnerData(null, { personType: "PJ", cnpj: "12ABC34501DE35" }))).toBe(OWNER_COMPANY_REQUIRED);
        expect(messageOf(() => resolveOwnerData(null, { personType: "PJ", companyName: "X" }))).toBe(OWNER_COMPANY_REQUIRED);
        expect(messageOf(() => resolveOwnerData(null, { personType: "PJ", companyName: "  ", cnpj: "12ABC34501DE35" }))).toBe(OWNER_COMPANY_REQUIRED);
    });

    it("PJ grava CNPJ normalizado e porte opcional", () => {
        expect(resolveOwnerData(null, { personType: "PJ", companyName: "Casa Azul Eventos", cnpj: "12.abc.345/01de-35" })).toEqual({
            ...pjWithSize,
            companySize: null,
        });
    });
});

describe("resolveOwnerData na edicao", () => {
    it("editar so o PIX de uma PJ com porte preserva tipo, empresa e porte", () => {
        expect(resolveOwnerData(pjWithSize, { pix: "x" } as never)).toEqual(pjWithSize);
    });

    it("PJ para PF limpa os campos de empresa", () => {
        expect(resolveOwnerData(pjWithSize, { personType: "PF" })).toEqual(pf);
    });

    it("PF para PJ sem CNPJ falha; com os campos passa", () => {
        expect(messageOf(() => resolveOwnerData(pf, { personType: "PJ", companyName: "X" }))).toBe(OWNER_COMPANY_REQUIRED);
        expect(resolveOwnerData(pf, { personType: "PJ", companyName: "X", cnpj: "12345678000195" })).toEqual({
            personType: "PJ",
            companyName: "X",
            cnpj: "12345678000195",
            companySize: null,
        });
    });

    it("companySize null remove so o porte", () => {
        expect(resolveOwnerData(pjWithSize, { companySize: null })).toEqual({ ...pjWithSize, companySize: null });
    });

    it("registro legado sem campos de empresa continua PF", () => {
        expect(resolveOwnerData(pf, { completeName: "Outro" } as never)).toEqual(pf);
    });
});

describe("schemas de escrita do proprietario", () => {
    it("aceitam os campos novos e recusam porte fora da lista", () => {
        expect(createOrganizationOwnerSchema.parse({ ...baseOwner, personType: "PJ", companySize: "EPP" }).companySize).toBe("EPP");
        expect(createVenueOwnerSchema.parse({ ...baseOwner, venueId: "v1", personType: "PF" }).personType).toBe("PF");
        expect(() => createOrganizationOwnerSchema.parse({ ...baseOwner, companySize: "GRANDE" })).toThrow(ZodError);
        expect(() => updateOwnerSchema.parse({ ownerId: "o1", data: { companySize: "GRANDE" } })).toThrow(ZodError);
    });

    it("edicao aceita companySize null e descarta organizationId", () => {
        const parsed = updateOwnerSchema.parse({ ownerId: "o1", data: { companySize: null, organizationId: "org-2" } });
        expect(parsed.data.companySize).toBeNull();
        expect(parsed.data).not.toHaveProperty("organizationId");
    });
});
