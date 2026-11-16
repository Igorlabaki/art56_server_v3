import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";
import { s3Client } from "../services/upload-config-sw";
import {
    StoredVenuePhoto,
    VENUE_PHOTO_TYPE_MESSAGE,
    VenuePhotoFile,
    VenuePhotoStorage,
    assertVenuePhotoFile,
    venuePhotoPublicUrl,
    venuePhotoStorageKey,
} from "./venue-photo-image";

export async function uploadVenuePhoto(venueId: string, file: VenuePhotoFile): Promise<StoredVenuePhoto> {
    assertVenuePhotoFile(file);
    let webp: Buffer;
    let width: number | null = null;
    let height: number | null = null;
    try {
        const converted = sharp(file.buffer).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 80 });
        webp = await converted.toBuffer();
        const metadata = await sharp(webp).metadata();
        width = metadata.width ?? null;
        height = metadata.height ?? null;
    } catch {
        throw new HttpBadRequestError(VENUE_PHOTO_TYPE_MESSAGE);
    }

    const storageKey = venuePhotoStorageKey(venueId);
    const bucket = process.env.AWS_BUCKET_NAME;
    await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        Body: webp,
        ContentType: "image/webp",
    }));

    return {
        url: venuePhotoPublicUrl(storageKey, bucket),
        storageKey,
        width,
        height,
        sizeBytes: webp.length,
    };
}

export async function deleteVenuePhotoObject(storageKey: string) {
    const bucket = process.env.AWS_BUCKET_NAME;
    if (!bucket || !storageKey || storageKey.startsWith("legacy:")) return;
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: storageKey }));
}

export const venuePhotoStorage: VenuePhotoStorage = {
    upload: uploadVenuePhoto,
    remove: deleteVenuePhotoObject,
};
