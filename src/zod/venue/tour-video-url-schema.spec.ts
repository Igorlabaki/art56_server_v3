import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
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

const accepted = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://m.youtube.com/shorts/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://cdn.example.com/tour.mp4?token=1",
];

describe("link do tour no update do venue", () => {
    it.each([updateVenueSchemaRequest, updateVenueSchemaDb] as const)("string vazia e null viram null", (schema) => {
        const parsed = schema.parse(
            schema === updateVenueSchemaRequest
                ? { ...requestBase, tourVideoUrl: "" }
                : { ...dbBase, data: { ...dbBase.data, tourVideoUrl: "" } }
        );
        const value = "data" in parsed ? parsed.data.tourVideoUrl : parsed.tourVideoUrl;
        expect(value).toBeNull();

        const parsedNull = schema.parse(
            schema === updateVenueSchemaRequest
                ? { ...requestBase, tourVideoUrl: null }
                : { ...dbBase, data: { ...dbBase.data, tourVideoUrl: null } }
        );
        const nullValue = "data" in parsedNull ? parsedNull.data.tourVideoUrl : parsedNull.tourVideoUrl;
        expect(nullValue).toBeNull();
    });

    it.each(accepted)("aceita %s", (tourVideoUrl) => {
        const parsed = updateVenueSchemaRequest.parse({ ...requestBase, tourVideoUrl });
        expect(parsed.tourVideoUrl).toBe(tourVideoUrl);
    });

    it.each([
        "https://exemplo.com/pagina",
        "http://cdn.example.com/tour.mp4",
        "javascript:alert(1)",
    ])("rejeita %s", (tourVideoUrl) => {
        expect(() => updateVenueSchemaRequest.parse({ ...requestBase, tourVideoUrl })).toThrow(ZodError);
    });
});
