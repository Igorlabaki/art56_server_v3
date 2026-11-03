import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { VenueAmenityRepositoryInterface } from "../../../repositories/interface/venue-amenity-repository-interface";
import { UpdateVenueAmenityParams } from "../../../zod/venue-amenity/update-venue-amenity-schema";
import { VenueAmenityAuthorizer } from "../venue-amenity-authorizer";

class UpdateVenueAmenityUseCase {
    constructor(
        private repository: VenueAmenityRepositoryInterface,
        private authorizer: VenueAmenityAuthorizer,
    ) {}

    async execute(userId: string | undefined, params: UpdateVenueAmenityParams) {
        const current = await this.repository.getById(params.amenityId);
        if (!current) {
            throw new HttpResourceNotFoundError("Caracteristica");
        }

        await this.authorizer.assert(userId, current.venueId, "EDIT_VENUE_AMENITIES");
        const existing = await this.repository.findByName(current.venueId, params.name);
        if (existing && existing.id !== current.id) {
            throw new HttpConflictError("Caracteristica");
        }
        const updated = await this.repository.update({
            ...params,
            position: params.position ?? current.position,
        });

        return {
            success: true,
            message: "Caracteristica atualizada com sucesso",
            data: updated,
            count: 1,
            type: "VenueAmenity",
        };
    }
}

export { UpdateVenueAmenityUseCase };
