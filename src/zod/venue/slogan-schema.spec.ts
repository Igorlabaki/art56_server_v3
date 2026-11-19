import { describe, expect, it } from "vitest";
import { updateVenueSchemaDb } from "./update-venue-params-schema";
import { updateVenueSchemaRequest } from "./update-venue-params-schema-db";

const requestBase = {
    venueId: "venue-1",
    userId: "user-1",
    pricingModel: "PER_DAY" as const,
};

const dbBase = {
    venueId: "venue-1",
    userId: "user-1",
    data: {
        pricingModel: "PER_DAY" as const,
    },
};

describe("slogan no update do venue", () => {
    it("aceita slogan ausente", () => {
        const request = updateVenueSchemaRequest.parse(requestBase);
        const db = updateVenueSchemaDb.parse(dbBase);
        expect(request.slogan).toBeUndefined();
        expect(db.data.slogan).toBeUndefined();
    });

    it("aceita slogan preenchido e vazio", () => {
        expect(updateVenueSchemaRequest.parse({ ...requestBase, slogan: "O oásis urbano" }).slogan).toBe("O oásis urbano");
        expect(updateVenueSchemaRequest.parse({ ...requestBase, slogan: "" }).slogan).toBe("");
        expect(updateVenueSchemaDb.parse({
            ...dbBase,
            data: { ...dbBase.data, slogan: "O oásis urbano" },
        }).data.slogan).toBe("O oásis urbano");
        expect(updateVenueSchemaDb.parse({
            ...dbBase,
            data: { ...dbBase.data, slogan: "" },
        }).data.slogan).toBe("");
    });

    it("mantem a descricao quando o slogan vem junto", () => {
        const parsed = updateVenueSchemaRequest.parse({
            ...requestBase,
            description: "Casa com piscina",
            slogan: "O oásis urbano",
        });
        expect(parsed.description).toBe("Casa com piscina");
        expect(parsed.slogan).toBe("O oásis urbano");
    });
});
