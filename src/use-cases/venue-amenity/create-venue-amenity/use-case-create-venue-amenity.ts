import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { assertPhotoBelongsToVenue, VenuePhotoRef } from "../../../functions/venue-photo-ref";
import {
    AmenityImageFile,
    AmenityImageStorage,
    assertAmenityImageFiles,
    removeAmenityImages,
    uploadAmenityImages,
} from "../../../functions/venue-amenity-image";
import { VenueAmenityImageInput, VenueAmenityRepositoryInterface } from "../../../repositories/interface/venue-amenity-repository-interface";
import { CreateVenueAmenityParams } from "../../../zod/venue-amenity/create-venue-amenity-schema";
import { VenueAmenityAuthorizer } from "../venue-amenity-authorizer";

class CreateVenueAmenityUseCase {
    constructor(
        private repository: VenueAmenityRepositoryInterface,
        private authorizer: VenueAmenityAuthorizer,
        private imageStorage: AmenityImageStorage,
        private photos?: { getById: (id: string) => Promise<VenuePhotoRef | null> },
    ) {}

    async execute(userId: string | undefined, params: CreateVenueAmenityParams, files: AmenityImageFile[] = []) {
        assertAmenityImageFiles(files);
        await this.authorizer.assert(userId, params.venueId, "EDIT_VENUE_AMENITIES");
        const existing = await this.repository.findByName(params.venueId, params.name);
        if (existing) {
            throw new HttpConflictError("Caracteristica");
        }
        const position = await this.repository.nextPosition(params.venueId);
        const images = await this.imagesFor(params.venueId, params.photoIds, files);
        let created;
        try {
            created = await this.repository.create({
                venueId: params.venueId,
                name: params.name,
                position,
                description: params.description ?? null,
                videoUrl: params.videoUrl ?? null,
            }, images);
        } catch (error) {
            await removeAmenityImages(this.imageStorage, images.filter((image) => !image.photoId).map((image) => image.imageUrl));
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

    private async imagesFor(venueId: string, photoIds: string[] | undefined, files: AmenityImageFile[]): Promise<VenueAmenityImageInput[]> {
        if (photoIds?.length) {
            const images: VenueAmenityImageInput[] = [];
            for (const photoId of photoIds) {
                const photo = assertPhotoBelongsToVenue(await this.photos?.getById(photoId), venueId);
                images.push({ imageUrl: photo.url, photoId: photo.id });
            }
            return images;
        }
        const uploaded = await uploadAmenityImages(this.imageStorage, files);
        return uploaded.map((imageUrl) => ({ imageUrl, photoId: null }));
    }
}

export { CreateVenueAmenityUseCase };
