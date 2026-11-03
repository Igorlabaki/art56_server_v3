import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { VenueAmenityRepositoryInterface } from "../../../repositories/interface/venue-amenity-repository-interface";
import { VenueAmenityAuthorizer } from "../venue-amenity-authorizer";

class DeleteVenueAmenityUseCase {
    constructor(
        private repository: VenueAmenityRepositoryInterface,
        private authorizer: VenueAmenityAuthorizer,
    ) {}

    async execute(userId: string | undefined, amenityId: string) {
        const current = await this.repository.getById(amenityId);
        if (!current) {
            throw new HttpResourceNotFoundError("Caracteristica");
        }

        await this.authorizer.assert(userId, current.venueId, "EDIT_VENUE_AMENITIES");
        const deleted = await this.repository.delete(amenityId);

        return {
            success: true,
            message: "Caracteristica removida com sucesso",
            data: deleted,
            count: 1,
            type: "VenueAmenity",
        };
    }
}

export { DeleteVenueAmenityUseCase };
