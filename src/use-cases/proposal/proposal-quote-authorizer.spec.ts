import { describe, expect, it, vi } from "vitest";
import { HttpForbiddenError } from "../../errors/errors-type/http-forbidden-error";
import { HttpTokenError } from "../../errors/errors-type/http-token-error";
import { assertDiscountAllowed, DISCOUNT_DENIAL, ProposalQuoteAuthorizer } from "./proposal-quote-authorizer";

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

describe("assertDiscountAllowed", () => {
    it("com 0% nao chama o autorizador", async () => {
        const authorizer = { assert: vi.fn() };
        await assertDiscountAllowed(authorizer, undefined, "venue-1", 0);
        expect(authorizer.assert).not.toHaveBeenCalled();
    });

    it("sem autorizador e com desconto falha fechado com 403", async () => {
        await expect(assertDiscountAllowed(undefined, "user-1", "venue-1", 10)).rejects.toBeInstanceOf(HttpForbiddenError);
    });

    it("com autorizador repassa DISCOUNT_DENIAL", async () => {
        const authorizer = { assert: vi.fn(async () => ({}) as never) };
        await assertDiscountAllowed(authorizer, "user-1", "venue-1", 10);
        expect(authorizer.assert).toHaveBeenCalledWith("user-1", "venue-1", DISCOUNT_DENIAL);
    });

    it("sem permissao no espaco devolve a mensagem de desconto", async () => {
        await expect(assertDiscountAllowed(subject("VIEW_VENUE_EVENTS"), "user-1", "venue-1", 10))
            .rejects.toThrow(DISCOUNT_DENIAL.message);
    });
});
