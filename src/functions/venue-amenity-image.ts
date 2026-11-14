import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";
import { SERVICE_IMAGE_MAX_BYTES } from "./service-image";

export const AMENITY_IMAGE_TYPE_MESSAGE = "A foto da caracteristica precisa ser uma imagem";
export const AMENITY_IMAGE_SIZE_MESSAGE = "A foto da caracteristica passa de 5 MB";
export const AMENITY_MAX_IMAGES = 3;
export const AMENITY_IMAGE_LIMIT_MESSAGE = `A caracteristica aceita no maximo ${AMENITY_MAX_IMAGES} fotos`;
export const AMENITY_IMAGE_INVALID_MESSAGE = "Foto da caracteristica invalida";

export type AmenityImageFile = { buffer: Buffer; size: number; mimetype: string };

export type AmenityImageStorage = {
    upload: (file: AmenityImageFile) => Promise<string>;
    remove: (imageUrl: string) => Promise<void>;
};

export function assertAmenityImageFile(file: { size: number; mimetype: string }) {
    if (!file.mimetype.startsWith("image/")) {
        throw new HttpBadRequestError(AMENITY_IMAGE_TYPE_MESSAGE);
    }
    if (file.size > SERVICE_IMAGE_MAX_BYTES) {
        throw new HttpBadRequestError(AMENITY_IMAGE_SIZE_MESSAGE);
    }
}

export function assertAmenityImageFiles(files: { size: number; mimetype: string }[]) {
    if (files.length > AMENITY_MAX_IMAGES) {
        throw new HttpBadRequestError(AMENITY_IMAGE_LIMIT_MESSAGE);
    }
    files.forEach(assertAmenityImageFile);
}

export type AmenityImageRef = { id: string } | { newIndex: number };

export function assertAmenityImageRefs(refs: AmenityImageRef[], currentIds: string[], fileCount: number) {
    if (refs.length > AMENITY_MAX_IMAGES) {
        throw new HttpBadRequestError(AMENITY_IMAGE_LIMIT_MESSAGE);
    }
    const ids = new Set<string>();
    const indexes = new Set<number>();
    for (const ref of refs) {
        if ("id" in ref) {
            if (!currentIds.includes(ref.id) || ids.has(ref.id)) {
                throw new HttpBadRequestError(AMENITY_IMAGE_INVALID_MESSAGE);
            }
            ids.add(ref.id);
        } else {
            if (ref.newIndex >= fileCount || indexes.has(ref.newIndex)) {
                throw new HttpBadRequestError(AMENITY_IMAGE_INVALID_MESSAGE);
            }
            indexes.add(ref.newIndex);
        }
    }
    if (indexes.size !== fileCount) {
        throw new HttpBadRequestError(AMENITY_IMAGE_INVALID_MESSAGE);
    }
}

export async function uploadAmenityImages(storage: AmenityImageStorage, files: AmenityImageFile[]) {
    const uploaded: string[] = [];
    try {
        for (const file of files) {
            uploaded.push(await storage.upload(file));
        }
    } catch (error) {
        await removeAmenityImages(storage, uploaded);
        throw error;
    }
    return uploaded;
}

export async function removeAmenityImages(storage: AmenityImageStorage, imageUrls: string[]) {
    for (const imageUrl of imageUrls) {
        await storage.remove(imageUrl);
    }
}
