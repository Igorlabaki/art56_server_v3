import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import {
    AmenityImageFile,
    AmenityImageStorage,
    assertAmenityImageFiles,
    removeAmenityImages,
    uploadAmenityImages,
} from "../../../functions/venue-amenity-image";
import { VenueAmenityRepositoryInterface } from "../../../repositories/interface/venue-amenity-repository-interface";
import { CreateVenueAmenityParams } from "../../../zod/venue-amenity/create-venue-amenity-schema";
import { VenueAmenityAuthorizer } from "../venue-amenity-authorizer";

class CreateVenueAmenityUseCase {
    constructor(
        private repository: VenueAmenityRepositoryInterface,
        private authorizer: VenueAmenityAuthorizer,
        private imageStorage: AmenityImageStorage,
    ) {}

    async execute(userId: string | undefined, params: CreateVenueAmenityParams, files: AmenityImageFile[] = []) {
        assertAmenityImageFiles(files);
        await this.authorizer.assert(userId, params.venueId, "EDIT_VENUE_AMENITIES");
        const existing = await this.repository.findByName(params.venueId, params.name);
        if (existing) {
            throw new HttpConflictError("Caracteristica");
        }
        const position = await this.repository.nextPosition(params.venueId);
        const imageUrls = await uploadAmenityImages(this.imageStorage, files);
        let created;
        try {
            created = await this.repository.create({
                venueId: params.venueId,
                name: params.name,
                position,
                description: params.description ?? null,
                videoUrl: params.videoUrl ?? null,
            }, imageUrls);
        } catch (error) {
            await removeAmenityImages(this.imageStorage, imageUrls);
            throw error;
        }

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
