import { VenueAmenityRepositoryInterface } from "../../../repositories/interface/venue-amenity-repository-interface";
import { VenueAmenityAuthorizer } from "../venue-amenity-authorizer";

class ListVenueAmenityUseCase {
    constructor(
        private repository: VenueAmenityRepositoryInterface,
        private authorizer: VenueAmenityAuthorizer,
    ) {}

    async execute(userId: string | undefined, venueId: string) {
        await this.authorizer.assert(userId, venueId, "VIEW_VENUE_AMENITIES");
        const amenities = await this.repository.listByVenue(venueId);

        return {
            success: true,
            message: `Lista de caracteristicas com ${amenities.length} items`,
            data: amenities,
            count: amenities.length,
            type: "VenueAmenity",
        };
    }
}

export { ListVenueAmenityUseCase };
