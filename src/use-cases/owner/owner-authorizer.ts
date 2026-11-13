import { Owner } from "@prisma/client";
import { HttpForbiddenError } from "../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../errors/errors-type/http-token-error";
import { OwnerRepositoryInterface } from "../../repositories/interface/owner-repository-interface";
import { UserOrganizationRepositoryInterface } from "../../repositories/interface/user-organization-repository-interface";
import { VenueRepositoryInterface } from "../../repositories/interface/venue-repository-interface";

export const OWNER_ORGANIZATION_FORBIDDEN = "Você não tem acesso a esta organização.";
export const OWNER_VENUE_FORBIDDEN = "Espaço fora desta organização.";

export class OwnerAuthorizer {
    constructor(
        private userOrganizationRepository: Pick<UserOrganizationRepositoryInterface, "verifyByUserIdAndOrganizationId">,
        private venueRepository: Pick<VenueRepositoryInterface, "getById">,
        private ownerRepository: Pick<OwnerRepositoryInterface, "getById">,
    ) {}

    async assertMember(userId: string | undefined, organizationId: string) {
        if (!userId) {
            throw new HttpTokenError();
        }

        if (!(await this.isMember(userId, organizationId))) {
            throw new HttpForbiddenError(OWNER_ORGANIZATION_FORBIDDEN);
        }
    }

    async assertVenuesInOrganization(venueIds: string[] | undefined, organizationId: string) {
        for (const venueId of new Set(venueIds ?? [])) {
            const venue = await this.venueRepository.getById({ venueId });
            if (!venue || venue.organizationId !== organizationId) {
                throw new HttpForbiddenError(OWNER_VENUE_FORBIDDEN);
            }
        }
    }

    /** Proprietario de outra organizacao responde como inexistente, para nao revelar o id. */
    async loadOwner(userId: string | undefined, ownerId: string): Promise<Owner> {
        if (!userId) {
            throw new HttpTokenError();
        }

        const owner = await this.ownerRepository.getById(ownerId);
        if (!owner || !(await this.isMember(userId, owner.organizationId))) {
            throw new HttpResourceNotFoundError("Proprietario");
        }

        return owner;
    }

    private async isMember(userId: string, organizationId: string) {
        const link = await this.userOrganizationRepository.verifyByUserIdAndOrganizationId({ userId, organizationId });
        if (!link) {
            console.error("[owner] acesso negado", { userId, organizationId });
        }
        return Boolean(link);
    }
}
