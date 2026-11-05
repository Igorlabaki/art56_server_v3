import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";
import { SERVICE_IMAGE_MAX_BYTES } from "./service-image";

const send = vi.hoisted(() => vi.fn());

vi.mock("../services/upload-config-sw", () => ({
    s3Client: { send },
}));

import { assertContactLogoFile, contactLogoKey } from "./contact-logo";
import { deleteContactLogo, uploadContactLogo } from "./contact-logo-storage";

const bucket = "logo-test-bucket";

beforeEach(() => {
    send.mockReset();
    send.mockResolvedValue({});
    process.env.AWS_BUCKET_NAME = bucket;
    process.env.AWS_REGION = "sa-east-1";
});

describe("logo do contato", () => {
    it("aceita jpeg, png, webp e gif e recusa svg ou arquivo grande", () => {
        for (const mimetype of ["image/jpeg", "image/png", "image/webp", "image/gif"]) {
            expect(() => assertContactLogoFile({ size: 100, mimetype })).not.toThrow();
        }
        expect(() => assertContactLogoFile({ size: 100, mimetype: "image/svg+xml" })).toThrow(HttpBadRequestError);
        expect(() => assertContactLogoFile({ size: SERVICE_IMAGE_MAX_BYTES + 1, mimetype: "image/jpeg" })).toThrow(HttpBadRequestError);
    });

    it("so apaga chave contact-logo do bucket do projeto", () => {
        const own = `https://${bucket}.s3.sa-east-1.amazonaws.com/contact-logo/a.webp`;
        expect(contactLogoKey(own, bucket)).toBe("contact-logo/a.webp");
        expect(contactLogoKey(`https://${bucket}.s3.sa-east-1.amazonaws.com/outro/a.webp`, bucket)).toBeNull();
        expect(contactLogoKey("https://outro.s3.sa-east-1.amazonaws.com/contact-logo/a.webp", bucket)).toBeNull();
    });

    it("jpeg vira webp em contact-logo e chave de fora nao e apagada", async () => {
        const jpeg = await sharp({
            create: { width: 8, height: 8, channels: 3, background: { r: 10, g: 20, b: 30 } },
        }).jpeg().toBuffer();
        const url = await uploadContactLogo({ buffer: jpeg, size: jpeg.length, mimetype: "image/jpeg" });
        expect(url).toContain(`https://${bucket}.s3.sa-east-1.amazonaws.com/contact-logo/`);
        expect(url.endsWith(".webp")).toBe(true);
        const put = send.mock.calls[0][0] as PutObjectCommand;
        expect(put).toBeInstanceOf(PutObjectCommand);
        expect(put.input.ContentType).toBe("image/webp");
        expect(put.input.Key?.startsWith("contact-logo/")).toBe(true);

        send.mockClear();
        await deleteContactLogo(`https://${bucket}.s3.sa-east-1.amazonaws.com/outro/a.webp`);
        expect(send).not.toHaveBeenCalled();

        await deleteContactLogo(url);
        const deleted = send.mock.calls[0][0] as DeleteObjectCommand;
        expect(deleted).toBeInstanceOf(DeleteObjectCommand);
        expect(deleted.input.Key).toBe(contactLogoKey(url, bucket));
    });
});
