import { describe, expect, it } from "vitest";
import { createProposalPerDayRequestParamsSchema } from "./create-proposal-per-day-params-schema";
import { createProposalPerPersonRequestParamsSchema } from "./create-proposal-per-person-params-schema";
import { updateProposalPerDayRequestParams } from "./update-proposal-per-day--params-schema";
import { updateProposalPerPersonRequestParams } from "./update-proposal-per-person-params-schema";
import { updatePersonalInfoProposalSchema } from "./update-personal-info-proposal-params-schema";

const createBase = {
    completeClientName: "Ana",
    venueId: "venue-1",
    endHour: "18:00",
    whatsapp: "11999999999",
    startHour: "10:00",
    description: "Festa",
    knowsVenue: false,
    guestNumber: "20",
    serviceIds: [],
    type: "EVENT" as const,
    trafficSource: "OTHER" as const,
};

describe("e-mail do orcamento no painel", () => {
    it("cria por dia com e-mail vazio gravando null", () => {
        const parsed = createProposalPerDayRequestParamsSchema.parse({
            ...createBase,
            startDay: "2026-12-01",
            endDay: "2026-12-02",
            email: "   ",
        });
        expect(parsed.email).toBeNull();
    });

    it("cria por pessoa sem e-mail gravando null", () => {
        const parsed = createProposalPerPersonRequestParamsSchema.parse({
            ...createBase,
            date: "2026-12-01",
        });
        expect(parsed.email).toBeNull();
    });

    it("aceita e-mail valido na criacao por dia", () => {
        const parsed = createProposalPerDayRequestParamsSchema.parse({
            ...createBase,
            startDay: "2026-12-01",
            endDay: "2026-12-02",
            email: " ana@cliente.com ",
        });
        expect(parsed.email).toBe("ana@cliente.com");
    });

    it("rejeita e-mail invalido na criacao e na edicao", () => {
        expect(() => createProposalPerPersonRequestParamsSchema.parse({
            ...createBase,
            date: "2026-12-01",
            email: "nao-e-email",
        })).toThrow();

        expect(() => updateProposalPerDayRequestParams.parse({
            proposalId: "proposal-1",
            data: {
                ...createBase,
                startDay: "2026-12-01",
                endDay: "2026-12-02",
                totalAmountInput: "1000",
                email: "nao-e-email",
            },
        })).toThrow();

        expect(() => updateProposalPerPersonRequestParams.parse({
            proposalId: "proposal-1",
            data: {
                ...createBase,
                date: "2026-12-01",
                totalAmountInput: "1000",
                email: "",
            },
        })).not.toThrow();
    });

    it("edicao com e-mail vazio grava null e whatsapp ausente falha", () => {
        const parsed = updateProposalPerPersonRequestParams.parse({
            proposalId: "proposal-1",
            data: {
                ...createBase,
                date: "2026-12-01",
                totalAmountInput: "1000",
                email: "",
            },
        });
        expect(parsed.data.email).toBeNull();

        expect(() => createProposalPerDayRequestParamsSchema.parse({
            ...createBase,
            startDay: "2026-12-01",
            endDay: "2026-12-02",
            whatsapp: undefined,
            email: null,
        })).toThrow();
    });
});

describe("e-mail nos dados do contrato", () => {
    const personal = {
        cpf: "123",
        cep: "01001000",
        city: "Sao Paulo",
        state: "SP",
        street: "Rua A",
        streetNumber: "10",
        neighborhood: "Centro",
        completeClientName: "Ana",
    };

    it("rejeita dados do contrato sem e-mail", () => {
        expect(() => updatePersonalInfoProposalSchema.parse({
            proposalId: "proposal-1",
            data: personal,
        })).toThrow();
    });

    it("rejeita e-mail invalido e aceita e-mail valido", () => {
        expect(() => updatePersonalInfoProposalSchema.parse({
            proposalId: "proposal-1",
            data: { ...personal, email: "ruim" },
        })).toThrow();

        const parsed = updatePersonalInfoProposalSchema.parse({
            proposalId: "proposal-1",
            data: { ...personal, email: " ana@cliente.com " },
        });
        expect(parsed.data.email).toBe("ana@cliente.com");
    });
});
