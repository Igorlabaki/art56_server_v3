import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { toVenuePresentation, VenuePublicPresentationSource } from "../../../functions/to-venue-presentation";

export interface VenuePublicPresentationReader {
    getPublicPresentation(venueId: string): Promise<VenuePublicPresentationSource | null>;
}

class GetVenuePresentationUseCase {
    constructor(private venues: VenuePublicPresentationReader) {}

    async execute(venueId: string) {
        const source = await this.venues.getPublicPresentation(venueId);
        if (!source) {
            throw new HttpResourceNotFoundError("Espaco");
        }

        const data = toVenuePresentation(source);
        return {
            success: true as const,
            message: "Apresentacao do espaco",
            data,
            count: 1,
            type: "VenuePresentation" as const,
        };
    }
}

export { GetVenuePresentationUseCase };
