import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { AmenityImageFile, AmenityImageStorage, assertAmenityImageFile } from "../../../functions/venue-amenity-image";
import { VenueAmenityRepositoryInterface } from "../../../repositories/interface/venue-amenity-repository-interface";
import { CreateVenueAmenityParams } from "../../../zod/venue-amenity/create-venue-amenity-schema";
import { VenueAmenityAuthorizer } from "../venue-amenity-authorizer";

class CreateVenueAmenityUseCase {
    constructor(
        private repository: VenueAmenityRepositoryInterface,
        private authorizer: VenueAmenityAuthorizer,
        private imageStorage: AmenityImageStorage,
    ) {}

    async execute(userId: string | undefined, params: CreateVenueAmenityParams, file?: AmenityImageFile) {
        if (file) {
            assertAmenityImageFile(file);
        }
        await this.authorizer.assert(userId, params.venueId, "EDIT_VENUE_AMENITIES");
        const existing = await this.repository.findByName(params.venueId, params.name);
        if (existing) {
            throw new HttpConflictError("Caracteristica");
        }
        const position = await this.repository.nextPosition(params.venueId);
        const imageUrl = file ? await this.imageStorage.upload(file) : null;
        const created = await this.repository.create({
            venueId: params.venueId,
            name: params.name,
            position,
            description: params.description ?? null,
            imageUrl,
            videoUrl: params.videoUrl ?? null,
        });

        return {
            success: true,
            message: "Caracteristica cadastrada com sucesso",
            data: created,
            count: 1,
            type: "VenueAmenity",
        };
    }
}

export { CreateVenueAmenityUseCase };
