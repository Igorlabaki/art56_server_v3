import { randomUUID } from "crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";
import { s3Client } from "../services/upload-config-sw";
import { assertServiceImageFile, serviceImageKey } from "./service-image";

export async function uploadServiceImage(file: { buffer: Buffer; size: number; mimetype: string }) {
    assertServiceImageFile(file);
    let webp: Buffer;
    try {
        webp = await sharp(file.buffer).resize({ width: 1200 }).webp({ quality: 80 }).toBuffer();
    } catch {
        throw new HttpBadRequestError("A foto do servico precisa ser uma imagem");
    }
    const fileKey = `${Date.now()}-${randomUUID()}.webp`;
    const bucket = process.env.AWS_BUCKET_NAME;
    await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: fileKey,
        Body: webp,
        ContentType: "image/webp",
    }));
    return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
}

export async function deleteServiceImage(imageUrl: string | null | undefined) {
    const bucket = process.env.AWS_BUCKET_NAME;
    const key = serviceImageKey(imageUrl ?? "", bucket);
    if (!key || !bucket) return;
    try {
        await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    } catch {
        return;
    }
}
