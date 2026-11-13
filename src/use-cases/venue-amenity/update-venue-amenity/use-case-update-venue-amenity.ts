import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { AmenityImageFile, AmenityImageStorage, assertAmenityImageFile } from "../../../functions/venue-amenity-image";
import { VenueAmenityRepositoryInterface } from "../../../repositories/interface/venue-amenity-repository-interface";
import { UpdateVenueAmenityParams } from "../../../zod/venue-amenity/update-venue-amenity-schema";
import { VenueAmenityAuthorizer } from "../venue-amenity-authorizer";

class UpdateVenueAmenityUseCase {
    constructor(
        private repository: VenueAmenityRepositoryInterface,
        private authorizer: VenueAmenityAuthorizer,
        private imageStorage: AmenityImageStorage,
    ) {}

    async execute(userId: string | undefined, params: UpdateVenueAmenityParams, file?: AmenityImageFile) {
        if (file) {
            assertAmenityImageFile(file);
        }
        const current = await this.repository.getById(params.amenityId);
        if (!current) {
            throw new HttpResourceNotFoundError("Caracteristica");
        }

        await this.authorizer.assert(userId, current.venueId, "EDIT_VENUE_AMENITIES");
        const existing = await this.repository.findByName(current.venueId, params.name);
        if (existing && existing.id !== current.id) {
            throw new HttpConflictError("Caracteristica");
        }

        const previousImageUrl = current.imageUrl;
        let imageUrl = previousImageUrl;
        if (file) {
            imageUrl = await this.imageStorage.upload(file);
        } else if (params.removeImage) {
            imageUrl = null;
        }

        const updated = await this.repository.update({
            amenityId: current.id,
            name: params.name,
            position: params.position ?? current.position,
            description: params.description === undefined ? current.description : params.description,
            imageUrl,
            videoUrl: params.videoUrl === undefined ? current.videoUrl : params.videoUrl,
        });

        if (previousImageUrl && previousImageUrl !== imageUrl) {
            await this.imageStorage.remove(previousImageUrl);
        }

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
