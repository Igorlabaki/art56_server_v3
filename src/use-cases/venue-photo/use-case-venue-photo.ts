import { VenuePhoto } from "@prisma/client";
import { HttpBadRequestError } from "../../errors/errors-type/htttp-bad-request-error";
import { HttpResourceNotFoundError } from "../../errors/errors-type/http-resource-not-found-error";
import {
    StoredVenuePhoto,
    VenuePhotoFile,
    VenuePhotoStorage,
    assertVenuePhotoFiles,
} from "../../functions/venue-photo-image";
import { VenuePhotoRepositoryInterface } from "../../repositories/interface/venue-photo-repository-interface";
import { VenuePhotoAuthorizer } from "./venue-photo-authorizer";
import { VenuePhotoInUseError, venuePhotoHasUsages } from "./venue-photo-in-use-error";

function ok(message: string, data: unknown, count: number) {
    return { success: true, message, data, count, type: "VenuePhoto" };
}

export class VenuePhotoUseCase {
    constructor(
        private repository: VenuePhotoRepositoryInterface,
        private authorizer: VenuePhotoAuthorizer,
        private storage: VenuePhotoStorage,
    ) {}

    async list(userId: string | undefined, venueId: string) {
        await this.authorizer.assert(userId, venueId, "VIEW_VENUE_PHOTOS");
        const photos = await this.repository.listByVenue(venueId);
        return ok(`Lista de fotos com ${photos.length} items`, photos, photos.length);
    }

    async upload(userId: string | undefined, venueId: string, files: VenuePhotoFile[]) {
        await this.authorizer.assert(userId, venueId, "EDIT_VENUE_PHOTOS");
        assertVenuePhotoFiles(files);

        const stored: StoredVenuePhoto[] = [];
        try {
            for (const file of files) {
                stored.push(await this.storage.upload(venueId, file));
            }
        } catch (error) {
            await this.removeStored(stored);
            throw error;
        }

        const created: VenuePhoto[] = [];
        try {
            for (const item of stored) {
                created.push(await this.repository.create({
                    venueId,
                    url: item.url,
                    storageKey: item.storageKey,
                    width: item.width,
                    height: item.height,
                    sizeBytes: item.sizeBytes,
                }));
            }
        } catch (error) {
            await this.removeStored(stored);
            for (const row of created) {
                await this.repository.delete(row.id);
            }
            throw error;
        }

        return ok("Fotos cadastradas com sucesso", created, created.length);
    }

    async updateDescription(userId: string | undefined, photoId: string, description: string | null) {
        const photo = await this.requirePhoto(photoId);
        await this.authorizer.assert(userId, photo.venueId, "EDIT_VENUE_PHOTOS");
        const updated = await this.repository.updateDescription(photoId, description);
        return ok("Descricao da foto atualizada", updated, 1);
    }

    async usages(userId: string | undefined, photoId: string) {
        const photo = await this.requirePhoto(photoId);
        await this.authorizer.assert(userId, photo.venueId, "VIEW_VENUE_PHOTOS");
        const usages = await this.repository.listUsages(photoId);
        return ok("Usos da foto", usages, 1);
    }

    async delete(userId: string | undefined, photoId: string) {
        const photo = await this.requirePhoto(photoId);
        await this.authorizer.assert(userId, photo.venueId, "EDIT_VENUE_PHOTOS");
        const usages = await this.repository.listUsages(photoId);
        if (venuePhotoHasUsages(usages)) {
            throw new VenuePhotoInUseError(usages);
        }
        await this.storage.remove(photo.storageKey);
        await this.repository.delete(photoId);
        return ok("Foto excluida", { id: photoId }, 1);
    }

    private async requirePhoto(photoId: string) {
        const photo = await this.repository.getById(photoId);
        if (!photo) {
            throw new HttpResourceNotFoundError("Foto");
        }
        if (!photo.venueId) {
            throw new HttpBadRequestError("Foto sem espaco");
        }
        return photo;
    }

    private async removeStored(stored: StoredVenuePhoto[]) {
        for (const item of stored) {
            await this.storage.remove(item.storageKey);
        }
    }
}
