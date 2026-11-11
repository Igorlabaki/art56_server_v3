import { vi } from "vitest";
import { ProposalQuoteAuthorizer } from "./proposal-quote-authorizer";

export const OWNER_ID = "owner-1";
export const STRANGER_ID = "stranger-1";

export function courtesyAuthorizer(venue: { id: string; organizationId: string }) {
    const authorizer = new ProposalQuoteAuthorizer(
        { getById: vi.fn(async () => venue) } as never,
        {
            getUserVenuePermission: vi.fn(async ({ userId }: { userId: string }) => (
                userId === OWNER_ID ? { permissions: "VIEW_VENUE_PROPOSALS" } : { permissions: "VIEW_VENUE_CALENDAR" }
            )),
        } as never,
    );
    const assert = vi.spyOn(authorizer, "assert");
    return { authorizer, assert };
}
