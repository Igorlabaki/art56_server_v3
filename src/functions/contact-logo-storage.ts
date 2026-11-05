import { randomUUID } from "crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";
import { s3Client } from "../services/upload-config-sw";
import { assertContactLogoFile, contactLogoKey } from "./contact-logo";

export async function uploadContactLogo(file: { buffer: Buffer; size: number; mimetype: string }) {
    assertContactLogoFile(file);
    let webp: Buffer;
    try {
        webp = await sharp(file.buffer).resize({ width: 512, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    } catch {
        throw new HttpBadRequestError("A logo precisa ser uma imagem");
    }
    const fileKey = `contact-logo/${Date.now()}-${randomUUID()}.webp`;
    const bucket = process.env.AWS_BUCKET_NAME;
    await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: fileKey,
        Body: webp,
        ContentType: "image/webp",
    }));
    return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
}

export async function deleteContactLogo(imageUrl: string | null | undefined) {
    const bucket = process.env.AWS_BUCKET_NAME;
    const key = contactLogoKey(imageUrl ?? "", bucket);
    if (!key || !bucket) return;
    try {
        await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    } catch {
        return;
    }
}
