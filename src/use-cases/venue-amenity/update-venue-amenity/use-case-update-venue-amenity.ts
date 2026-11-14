import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import {
    AMENITY_IMAGE_INVALID_MESSAGE,
    AmenityImageFile,
    AmenityImageStorage,
    assertAmenityImageFiles,
    assertAmenityImageRefs,
    removeAmenityImages,
    uploadAmenityImages,
} from "../../../functions/venue-amenity-image";
import {
    VenueAmenityImageInput,
    VenueAmenityRepositoryInterface,
} from "../../../repositories/interface/venue-amenity-repository-interface";
import { UpdateVenueAmenityParams } from "../../../zod/venue-amenity/update-venue-amenity-schema";
import { VenueAmenityAuthorizer } from "../venue-amenity-authorizer";

class UpdateVenueAmenityUseCase {
    constructor(
        private repository: VenueAmenityRepositoryInterface,
        private authorizer: VenueAmenityAuthorizer,
        private imageStorage: AmenityImageStorage,
    ) {}

    async execute(userId: string | undefined, params: UpdateVenueAmenityParams, files: AmenityImageFile[] = []) {
        assertAmenityImageFiles(files);
        if (!params.images && files.length > 0) {
            throw new HttpBadRequestError(AMENITY_IMAGE_INVALID_MESSAGE);
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
        if (params.images) {
            assertAmenityImageRefs(params.images, current.images.map((image) => image.id), files.length);
        }

        const uploaded = await uploadAmenityImages(this.imageStorage, files);
        const currentUrls = new Map(current.images.map((image) => [image.id, image.imageUrl]));
        const images: VenueAmenityImageInput[] | undefined = params.images?.map((ref) =>
            "id" in ref
                ? { id: ref.id, imageUrl: currentUrls.get(ref.id) as string }
                : { imageUrl: uploaded[ref.newIndex] },
        );
        const keptIds = new Set(images?.flatMap((image) => (image.id ? [image.id] : [])) ?? []);
        const removedUrls = images
            ? current.images.filter((image) => !keptIds.has(image.id)).map((image) => image.imageUrl)
            : [];

        let updated;
        try {
            updated = await this.repository.update({
                amenityId: current.id,
                name: params.name,
                position: params.position ?? current.position,
                description: params.description === undefined ? current.description : params.description,
                videoUrl: params.videoUrl === undefined ? current.videoUrl : params.videoUrl,
            }, images);
        } catch (error) {
            await removeAmenityImages(this.imageStorage, uploaded);
            throw error;
        }

        await removeAmenityImages(this.imageStorage, removedUrls);

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
