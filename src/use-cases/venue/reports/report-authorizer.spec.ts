import { describe, expect, it } from "vitest";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { ReportAuthorizer } from "./report-authorizer";

function authorizerFor(permissions: string | null) {
    const calls: { organizationId: string; venueId?: string }[] = [];
    const authorizer = new ReportAuthorizer(
        {
            getById: async ({ venueId }) =>
                venueId === "venue-a" ? ({ id: "venue-a", organizationId: "org-1", maxGuest: 100 } as never) : null,
        },
        {
            getUserVenuePermission: async (params) => {
                calls.push({ organizationId: params.organizationId, venueId: params.venueId });
                return permissions === null ? null : ({ permissions } as never);
            },
        },
    );
    return { authorizer, calls };
}

describe("ReportAuthorizer", () => {
    it("recusa sem token", async () => {
        const { authorizer, calls } = authorizerFor("VIEW_VENUE_ANALYSIS");
        await expect(authorizer.assert(undefined, "venue-a")).rejects.toBeInstanceOf(HttpTokenError);
        expect(calls).toEqual([]);
    });

    it("responde 404 para espaco inexistente sem consultar permissao", async () => {
        const { authorizer, calls } = authorizerFor("VIEW_VENUE_ANALYSIS");
        await expect(authorizer.assert("user-1", "venue-x")).rejects.toBeInstanceOf(HttpResourceNotFoundError);
        expect(calls).toEqual([]);
    });

    it("recusa sem VIEW_VENUE_ANALYSIS ou sem vinculo", async () => {
        await expect(authorizerFor("VIEW_VENUE_INFO,VIEW_VENUE_EVENTS").authorizer.assert("user-1", "venue-a"))
            .rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(authorizerFor(null).authorizer.assert("user-1", "venue-a"))
            .rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(authorizerFor("VIEW_VENUE_ANALYSIS_X").authorizer.assert("user-1", "venue-a"))
            .rejects.toBeInstanceOf(HttpForbiddenError);
    });

    it("aceita a permissao com espacos e devolve o espaco consultando pela organizacao dele", async () => {
        const { authorizer, calls } = authorizerFor("VIEW_VENUE_INFO, VIEW_VENUE_ANALYSIS ");
        const venue = await authorizer.assert("user-1", "venue-a");
        expect(venue).toMatchObject({ id: "venue-a", maxGuest: 100 });
        expect(calls).toEqual([{ organizationId: "org-1", venueId: "venue-a" }]);
    });
});
