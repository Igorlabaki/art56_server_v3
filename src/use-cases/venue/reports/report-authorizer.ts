import { Venue } from "@prisma/client";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { UserVenuePermissionRepositoryInterface } from "../../../repositories/interface/user-venue-permission-repository-interface";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";

export const REPORT_PERMISSION = "VIEW_VENUE_ANALYSIS";

export class ReportAuthorizer {
    constructor(
        private venueRepository: Pick<VenueRepositoryInterface, "getById">,
        private permissionRepository: Pick<UserVenuePermissionRepositoryInterface, "getUserVenuePermission">,
    ) {}

    async assert(userId: string | undefined, venueId: string): Promise<Venue> {
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

        if (!granted.includes(REPORT_PERMISSION)) {
            console.error("[reports] permissao negada", { userId, venueId });
            throw new HttpForbiddenError("Voce nao tem permissao para ver os relatorios deste espaco.");
        }

        return venue;
    }
}
