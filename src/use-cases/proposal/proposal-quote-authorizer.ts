import { HttpForbiddenError } from "../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../errors/errors-type/http-token-error";
import { VenueForAmounts } from "../../functions/proposal-amounts";
import { hasCourtesy } from "../../functions/quote-service-lines";
import { UserVenuePermissionRepositoryInterface } from "../../repositories/interface/user-venue-permission-repository-interface";
import { VenueRepositoryInterface } from "../../repositories/interface/venue-repository-interface";

const QUOTE_PERMISSIONS = ["VIEW_VENUE_PROPOSALS", "EDIT_VENUE_INFO"];

export interface PermissionDenial {
    log: string;
    message: string;
}

const QUOTE_DENIAL: PermissionDenial = {
    log: "[proposal-quote] permissao negada",
    message: "Voce nao tem permissao de orcamentos neste espaco.",
};

export const COURTESY_DENIAL: PermissionDenial = {
    log: "[proposal-courtesy] permissao negada",
    message: "Você não tem permissão para dar cortesia neste espaço.",
};

export const DISCOUNT_DENIAL: PermissionDenial = {
    log: "[proposal-discount] permissao negada",
    message: "Você não tem permissão para dar desconto neste espaço.",
};

export class ProposalQuoteAuthorizer {
    constructor(
        private venueRepository: Pick<VenueRepositoryInterface, "getById">,
        private permissionRepository: Pick<UserVenuePermissionRepositoryInterface, "getUserVenuePermission">,
    ) {}

    async assert(userId: string | undefined, venueId: string, denial: PermissionDenial = QUOTE_DENIAL): Promise<VenueForAmounts> {
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
            console.error(denial.log, { userId, venueId });
            throw new HttpForbiddenError(denial.message);
        }

        return venue as unknown as VenueForAmounts;
    }
}

export type CourtesyAuthorizer = Pick<ProposalQuoteAuthorizer, "assert">;

export async function assertCourtesyAllowed(
    authorizer: CourtesyAuthorizer | undefined,
    authUserId: string | null | undefined,
    venueId: string,
    courtesyByServiceId: Record<string, number>,
): Promise<void> {
    if (!hasCourtesy(courtesyByServiceId)) return;
    if (!authorizer) {
        console.error(COURTESY_DENIAL.log, { userId: authUserId, venueId });
        throw new HttpForbiddenError(COURTESY_DENIAL.message);
    }
    await authorizer.assert(authUserId ?? undefined, venueId, COURTESY_DENIAL);
}

export async function assertDiscountAllowed(
    authorizer: CourtesyAuthorizer | undefined,
    authUserId: string | null | undefined,
    venueId: string,
    percent: number,
): Promise<void> {
    if (!percent) return;
    if (!authorizer) {
        console.error(DISCOUNT_DENIAL.log, { userId: authUserId, venueId });
        throw new HttpForbiddenError(DISCOUNT_DENIAL.message);
    }
    await authorizer.assert(authUserId ?? undefined, venueId, DISCOUNT_DENIAL);
}
