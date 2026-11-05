import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";
import { SERVICE_IMAGE_MAX_BYTES } from "./service-image";

const LOGO_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function assertContactLogoFile(file: { size: number; mimetype: string }) {
    if (!LOGO_MIME_TYPES.has(file.mimetype)) {
        throw new HttpBadRequestError("A logo precisa ser uma imagem");
    }
    if (file.size > SERVICE_IMAGE_MAX_BYTES) {
        throw new HttpBadRequestError("A logo passa de 5 MB");
    }
}

export function contactLogoKey(imageUrl: string, bucket: string | undefined) {
    if (!bucket || !imageUrl.includes(`${bucket}.s3.`)) return null;
    const marker = ".amazonaws.com/";
    const index = imageUrl.indexOf(marker);
    if (index < 0) return null;
    const key = imageUrl.slice(index + marker.length);
    if (!key.startsWith("contact-logo/")) return null;
    return key;
}

export function readContactBody(body: unknown) {
    if (body && typeof body === "object" && "payload" in body && typeof (body as { payload?: unknown }).payload === "string") {
        return JSON.parse((body as { payload: string }).payload);
    }
    return body;
}

export function readRemoveLogo(body: unknown) {
    const source = readContactBody(body);
    if (!source || typeof source !== "object" || !("data" in source)) return false;
    const data = (source as { data?: unknown }).data;
    if (!data || typeof data !== "object") return false;
    const flag = (data as { removeLogo?: unknown }).removeLogo;
    return flag === true || flag === "true";
}
