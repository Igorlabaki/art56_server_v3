import { HttpForbiddenError } from "../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../errors/errors-type/http-token-error";
import { VenueForAmounts } from "../../functions/proposal-amounts";
import { UserVenuePermissionRepositoryInterface } from "../../repositories/interface/user-venue-permission-repository-interface";
import { VenueRepositoryInterface } from "../../repositories/interface/venue-repository-interface";

const QUOTE_PERMISSIONS = ["VIEW_VENUE_PROPOSALS", "EDIT_VENUE_INFO"];

export class ProposalQuoteAuthorizer {
    constructor(
        private venueRepository: Pick<VenueRepositoryInterface, "getById">,
        private permissionRepository: Pick<UserVenuePermissionRepositoryInterface, "getUserVenuePermission">,
    ) {}

    async assert(userId: string | undefined, venueId: string): Promise<VenueForAmounts> {
        if (!userId) {
            throw new HttpTokenError();
        }

        const venue = await this.venueRepository.getById({ venueId });
        if (!venue) {
            throw new HttpResourceNotFoundError("Espaco");
        }

        const link = await this.permissionRepository.getUserVenuePermission({
            userId,
            organizationId: venue.organizationId,
            venueId,
        });

        const granted = (link?.permissions ?? "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        if (!QUOTE_PERMISSIONS.some((permission) => granted.includes(permission))) {
            console.error("[proposal-quote] permissao negada", { userId, venueId });
            throw new HttpForbiddenError("Voce nao tem permissao de orcamentos neste espaco.");
        }

        return venue as unknown as VenueForAmounts;
    }
}
