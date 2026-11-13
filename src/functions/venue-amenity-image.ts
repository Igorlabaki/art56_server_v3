import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";
import { SERVICE_IMAGE_MAX_BYTES } from "./service-image";

export const AMENITY_IMAGE_TYPE_MESSAGE = "A foto da caracteristica precisa ser uma imagem";

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
        throw new HttpBadRequestError("A foto da caracteristica passa de 5 MB");
    }
}
