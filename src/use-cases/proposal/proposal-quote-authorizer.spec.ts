import { describe, expect, it, vi } from "vitest";
import { HttpForbiddenError } from "../../errors/errors-type/http-forbidden-error";
import { HttpTokenError } from "../../errors/errors-type/http-token-error";
import { ProposalQuoteAuthorizer } from "./proposal-quote-authorizer";

function subject(permissions: string | null) {
    const venueRepository = {
        getById: vi.fn(async () => ({ id: "venue-1", organizationId: "org-1", pricingModel: "PER_PERSON" })),
    };
    const permissionRepository = {
        getUserVenuePermission: vi.fn(async () => (permissions === null ? null : { permissions })),
    };
    return new ProposalQuoteAuthorizer(venueRepository as never, permissionRepository as never);
}

describe("ProposalQuoteAuthorizer", () => {
    it("recusa sem usuario", async () => {
        await expect(subject("VIEW_VENUE_PROPOSALS").assert(undefined, "venue-1")).rejects.toBeInstanceOf(HttpTokenError);
    });

    it("recusa sem vinculo ou sem as permissoes de orcamento", async () => {
        await expect(subject(null).assert("user-1", "venue-1")).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(subject("VIEW_VENUE_PRICES,VIEW_VENUE_EVENTS").assert("user-1", "venue-1")).rejects.toBeInstanceOf(HttpForbiddenError);
    });

    it("aceita VIEW_VENUE_PROPOSALS ou EDIT_VENUE_INFO e devolve o espaco", async () => {
        await expect(subject("VIEW_VENUE_EVENTS, VIEW_VENUE_PROPOSALS").assert("user-1", "venue-1")).resolves.toMatchObject({ id: "venue-1" });
        await expect(subject("EDIT_VENUE_INFO").assert("user-1", "venue-1")).resolves.toMatchObject({ id: "venue-1" });
    });
});
