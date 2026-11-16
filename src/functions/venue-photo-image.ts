import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { handleErrors } from "../errors/error-handler";
import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";

export const VENUE_PHOTO_MAX_FILES = 20;
export const VENUE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const VENUE_PHOTO_TYPE_MESSAGE = "A foto precisa ser uma imagem";
export const VENUE_PHOTO_SIZE_MESSAGE = "A foto passa de 5 MB";
export const VENUE_PHOTO_COUNT_MESSAGE = `Envie de 1 a ${VENUE_PHOTO_MAX_FILES} fotos`;
export const VENUE_PHOTO_INVALID_MESSAGE = "Foto invalida";

export type VenuePhotoFile = { buffer: Buffer; size: number; mimetype: string };

export type StoredVenuePhoto = {
    url: string;
    storageKey: string;
    width: number | null;
    height: number | null;
    sizeBytes: number;
};

export type VenuePhotoStorage = {
    upload: (venueId: string, file: VenuePhotoFile) => Promise<StoredVenuePhoto>;
    remove: (storageKey: string) => Promise<void>;
};

export function venuePhotoStorageKey(venueId: string, fileId = randomUUID()) {
    return `venues/${venueId}/photos/${fileId}.webp`;
}

export function venuePhotoPublicUrl(storageKey: string, bucket = process.env.AWS_BUCKET_NAME, region = process.env.AWS_REGION) {
    return `https://${bucket}.s3.${region}.amazonaws.com/${storageKey}`;
}

export function assertVenuePhotoFile(file: { size: number; mimetype: string }) {
    if (!file.mimetype.startsWith("image/")) {
        throw new HttpBadRequestError(VENUE_PHOTO_TYPE_MESSAGE);
    }
    if (file.size > VENUE_PHOTO_MAX_BYTES) {
        throw new HttpBadRequestError(VENUE_PHOTO_SIZE_MESSAGE);
    }
}

export function assertVenuePhotoFiles(files: { size: number; mimetype: string }[]) {
    if (files.length < 1 || files.length > VENUE_PHOTO_MAX_FILES) {
        throw new HttpBadRequestError(VENUE_PHOTO_COUNT_MESSAGE);
    }
    files.forEach(assertVenuePhotoFile);
}

const receiveFiles = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: VENUE_PHOTO_MAX_BYTES },
}).array("files", VENUE_PHOTO_MAX_FILES);

export function venuePhotoUploadError(error: unknown): unknown {
    if (!(error instanceof multer.MulterError)) return error;
    if (error.code === "LIMIT_FILE_SIZE") return new HttpBadRequestError(VENUE_PHOTO_SIZE_MESSAGE);
    if (error.code === "LIMIT_UNEXPECTED_FILE" || error.code === "LIMIT_FILE_COUNT") {
        return new HttpBadRequestError(VENUE_PHOTO_COUNT_MESSAGE);
    }
    return new HttpBadRequestError(VENUE_PHOTO_INVALID_MESSAGE);
}

export function receiveVenuePhotos(req: Request, res: Response, next: NextFunction) {
    receiveFiles(req, res, (error?: unknown) => {
        if (!error) return next();
        const response = handleErrors(venuePhotoUploadError(error));
        res.status(response.statusCode).json(response.body);
    });
}

export function venuePhotoRequestFiles(req: Request): VenuePhotoFile[] {
    return Array.isArray(req.files) ? req.files : [];
}
