import { VenuePhotoUsages } from "../../repositories/interface/venue-photo-repository-interface";

export class VenuePhotoInUseError extends Error {
    statusCode = 409;
    name = "Conflito";

    constructor(public usages: VenuePhotoUsages) {
        super("A foto esta em uso");
        this.message = "A foto esta em uso";
    }
}

export function venuePhotoHasUsages(usages: VenuePhotoUsages) {
    return usages.siteImages.length + usages.services.length + usages.amenities.length + usages.emailConfigs.length > 0;
}
