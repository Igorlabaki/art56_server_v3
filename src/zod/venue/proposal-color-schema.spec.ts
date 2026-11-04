import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { updateVenueSchemaRequest } from "./update-venue-params-schema-db";
import { ensureAuthenticate } from "../../middleware/ensureAuthenticate";

const base = {
    venueId: "venue-1",
    userId: "user-1",
    pricingModel: "PER_DAY" as const,
};

describe("cores da proposta no update do venue", () => {
    it("grava hex valido", () => {
        const parsed = updateVenueSchemaRequest.parse({
            ...base,
            proposalPrimaryColor: "#112233",
            proposalSecondaryColor: "#aabbcc",
            proposalTextColor: "#000000",
        });

        expect(parsed.proposalPrimaryColor).toBe("#112233");
        expect(parsed.proposalSecondaryColor).toBe("#aabbcc");
        expect(parsed.proposalTextColor).toBe("#000000");
    });

    it("string vazia grava null", () => {
        const parsed = updateVenueSchemaRequest.parse({
            ...base,
            proposalPrimaryColor: "",
            proposalSecondaryColor: "",
            proposalTextColor: "",
        });

        expect(parsed.proposalPrimaryColor).toBeNull();
        expect(parsed.proposalSecondaryColor).toBeNull();
        expect(parsed.proposalTextColor).toBeNull();
    });

    it("cor invalida nao passa na validacao", () => {
        expect(() =>
            updateVenueSchemaRequest.parse({
                ...base,
                proposalPrimaryColor: "vermelho",
            })
        ).toThrow(ZodError);
    });
});

describe("update do venue sem token", () => {
    it("responde 401 e nao chama o proximo middleware", () => {
        const status = vi.fn().mockReturnThis();
        const json = vi.fn();
        const next = vi.fn();

        ensureAuthenticate(
            { headers: {} } as never,
            { status, json } as never,
            next
        );

        expect(status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});
