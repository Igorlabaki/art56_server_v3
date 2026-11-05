import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";

export const SERVICE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function assertServiceImageFile(file: { size: number; mimetype: string }) {
    if (!file.mimetype.startsWith("image/")) {
        throw new HttpBadRequestError("A foto do servico precisa ser uma imagem");
    }
    if (file.size > SERVICE_IMAGE_MAX_BYTES) {
        throw new HttpBadRequestError("A foto do servico passa de 5 MB");
    }
}

export function serviceImageKey(imageUrl: string, bucket: string | undefined) {
    if (!bucket || !imageUrl.includes(`${bucket}.s3.`)) return null;
    return imageUrl.split("/").pop() ?? null;
}
