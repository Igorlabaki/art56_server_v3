import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { handleErrors } from "../errors/error-handler";
import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";
import { SERVICE_IMAGE_MAX_BYTES } from "./service-image";
import {
    AMENITY_IMAGE_INVALID_MESSAGE,
    AMENITY_IMAGE_LIMIT_MESSAGE,
    AMENITY_IMAGE_SIZE_MESSAGE,
    AMENITY_MAX_IMAGES,
    AmenityImageFile,
} from "./venue-amenity-image";

const receiveFiles = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: SERVICE_IMAGE_MAX_BYTES },
}).array("files", AMENITY_MAX_IMAGES);

export function amenityUploadError(error: unknown): unknown {
    if (!(error instanceof multer.MulterError)) return error;
    if (error.code === "LIMIT_FILE_SIZE") return new HttpBadRequestError(AMENITY_IMAGE_SIZE_MESSAGE);
    if (error.code === "LIMIT_UNEXPECTED_FILE" || error.code === "LIMIT_FILE_COUNT") {
        return new HttpBadRequestError(AMENITY_IMAGE_LIMIT_MESSAGE);
    }
    return new HttpBadRequestError(AMENITY_IMAGE_INVALID_MESSAGE);
}

export function receiveAmenityImages(req: Request, res: Response, next: NextFunction) {
    receiveFiles(req, res, (error?: unknown) => {
        if (!error) return next();
        const response = handleErrors(amenityUploadError(error));
        res.status(response.statusCode).json(response.body);
    });
}

export function amenityRequestFiles(req: Request): AmenityImageFile[] {
    return Array.isArray(req.files) ? req.files : [];
}
