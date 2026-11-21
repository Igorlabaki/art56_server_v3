import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.hoisted(() => vi.fn());

vi.mock("../../services/upload-config-sw", () => ({
    s3Client: { send },
}));

import { CreateVenueController } from "./create-venue/controller-create-venue";
import { UpdateVenueController } from "./update-venue/controller-update-venue";

const bucket = "venue-icon-bucket";

function jsonResponse() {
    const response = {
        statusCode: 200,
        body: undefined as unknown,
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        json(payload: unknown) {
            this.body = payload;
            return this;
        },
    };
    return response;
}

function file(name: string, mimetype: string) {
    return { buffer: Buffer.from(name), mimetype, originalname: name };
}

const createBody = {
    userId: "user-1",
    organizationId: "org-1",
    cep: "00000000",
    email: "casa@example.com",
    name: "Casa",
    city: "Sao Paulo",
    state: "SP",
    street: "Rua",
    maxGuest: "100",
    streetNumber: "1",
    neighborhood: "Centro",
    owners: "[]",
    hasOvernightStay: "false",
    pricingModel: "PER_DAY",
};

const updateBody = {
    venueId: "venue-1",
    userId: "user-1",
    pricingModel: "PER_DAY",
};

function puts() {
    return send.mock.calls
        .map(([command]) => command)
        .filter((command) => command instanceof PutObjectCommand) as PutObjectCommand[];
}

function deletes() {
    return send.mock.calls
        .map(([command]) => command)
        .filter((command) => command instanceof DeleteObjectCommand) as DeleteObjectCommand[];
}

beforeEach(() => {
    send.mockReset();
    send.mockResolvedValue({});
    process.env.AWS_BUCKET_NAME = bucket;
    process.env.AWS_REGION = "sa-east-1";
});

describe("icone da aba no espaco", () => {
    it("logo e icone no mesmo envio geram URLs diferentes", async () => {
        const execute = vi.fn().mockResolvedValue({ success: true });
        const getById = vi.fn().mockResolvedValue({ logoUrl: null, faviconUrl: null });
        const controller = new UpdateVenueController({ execute } as never, { getById } as never);
        const response = jsonResponse();

        await controller.handle({
            body: updateBody,
            files: {
                file: [file("logo.png", "image/png")],
                favicon: [file("icone.png", "image/png")],
            },
        } as never, response as never);

        const data = execute.mock.calls[0][0].data;
        expect(data.logoUrl).toContain(`https://${bucket}.s3.sa-east-1.amazonaws.com/`);
        expect(data.faviconUrl).toContain(`https://${bucket}.s3.sa-east-1.amazonaws.com/`);
        expect(data.logoUrl).not.toBe(data.faviconUrl);
        expect(puts()).toHaveLength(2);
        expect(response.statusCode).toBe(200);
    });

    it("so o icone nao muda o logo", async () => {
        const execute = vi.fn().mockResolvedValue({ success: true });
        const getById = vi.fn().mockResolvedValue({
            logoUrl: `https://${bucket}.s3.sa-east-1.amazonaws.com/logo-antigo.png`,
            faviconUrl: null,
        });
        const controller = new UpdateVenueController({ execute } as never, { getById } as never);

        await controller.handle({
            body: updateBody,
            files: { favicon: [file("icone.png", "image/png")] },
        } as never, jsonResponse() as never);

        const data = execute.mock.calls[0][0].data;
        expect(data.logoUrl).toBeUndefined();
        expect(data.faviconUrl).toContain("icone.png");
        expect(deletes().map((command) => command.input.Key)).not.toContain("logo-antigo.png");
    });

    it("so o logo nao muda o icone", async () => {
        const execute = vi.fn().mockResolvedValue({ success: true });
        const getById = vi.fn().mockResolvedValue({
            logoUrl: null,
            faviconUrl: `https://${bucket}.s3.sa-east-1.amazonaws.com/icone-antigo.png`,
        });
        const controller = new UpdateVenueController({ execute } as never, { getById } as never);

        await controller.handle({
            body: updateBody,
            files: { file: [file("logo.png", "image/png")] },
        } as never, jsonResponse() as never);

        const data = execute.mock.calls[0][0].data;
        expect(data.faviconUrl).toBeUndefined();
        expect(data.logoUrl).toContain("logo.png");
        expect(deletes().map((command) => command.input.Key)).not.toContain("icone-antigo.png");
    });

    it("tipo que nao e imagem nao sobe e nao grava", async () => {
        const execute = vi.fn().mockResolvedValue({ success: true });
        const getById = vi.fn();
        const controller = new UpdateVenueController({ execute } as never, { getById } as never);
        const response = jsonResponse();

        await controller.handle({
            body: updateBody,
            files: { favicon: [file("icone.txt", "text/plain")] },
        } as never, response as never);

        expect(send).not.toHaveBeenCalled();
        expect(execute).not.toHaveBeenCalled();
        expect(getById).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
    });

    it("falha no envio do icone nao apaga o anterior", async () => {
        send.mockRejectedValueOnce(new Error("s3 fora"));
        const execute = vi.fn().mockResolvedValue({ success: true });
        const getById = vi.fn().mockResolvedValue({
            faviconUrl: `https://${bucket}.s3.sa-east-1.amazonaws.com/icone-antigo.png`,
        });
        const controller = new UpdateVenueController({ execute } as never, { getById } as never);
        const response = jsonResponse();

        await controller.handle({
            body: updateBody,
            files: { favicon: [file("icone.png", "image/png")] },
        } as never, response as never);

        expect(puts()).toHaveLength(1);
        expect(deletes()).toHaveLength(0);
        expect(execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(500);
    });

    it("string faviconUrl no corpo nao grava a coluna", async () => {
        const execute = vi.fn().mockResolvedValue({ success: true });
        const controller = new UpdateVenueController({ execute } as never, { getById: vi.fn() } as never);

        await controller.handle({
            body: { ...updateBody, faviconUrl: "https://evil.example/icone.png" },
            files: {},
        } as never, jsonResponse() as never);

        expect(execute.mock.calls[0][0].data.faviconUrl).toBeUndefined();
        expect(send).not.toHaveBeenCalled();
    });

    it("icone novo so apaga o anterior depois de gravar", async () => {
        const execute = vi.fn().mockResolvedValue({ success: true });
        const getById = vi.fn().mockResolvedValue({
            faviconUrl: `https://${bucket}.s3.sa-east-1.amazonaws.com/icone-antigo.png`,
        });
        const controller = new UpdateVenueController({ execute } as never, { getById } as never);

        await controller.handle({
            body: updateBody,
            files: { favicon: [file("icone.png", "image/png")] },
        } as never, jsonResponse() as never);

        expect(deletes().map((command) => command.input.Key)).toEqual(["icone-antigo.png"]);
        expect(execute.mock.invocationCallOrder[0]).toBeLessThan(send.mock.invocationCallOrder.at(-1)!);
    });

    it("criar com logo e icone grava os dois, e tipo invalido nao sobe", async () => {
        const execute = vi.fn().mockResolvedValue({ success: true });
        const controller = new CreateVenueController({ execute } as never);
        const response = jsonResponse();

        await controller.handle({
            body: createBody,
            files: {
                file: [file("logo.png", "image/png")],
                favicon: [file("icone.png", "image/png")],
            },
        } as never, response as never);

        const data = execute.mock.calls[0][0].data;
        expect(data.logoUrl).not.toBe(data.faviconUrl);
        expect(response.statusCode).toBe(201);

        const rejected = jsonResponse();
        await controller.handle({
            body: createBody,
            files: { favicon: [file("icone.pdf", "application/pdf")] },
        } as never, rejected as never);

        expect(rejected.statusCode).toBe(400);
        expect(execute).toHaveBeenCalledTimes(1);
    });
});
