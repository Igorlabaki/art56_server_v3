import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../../services/upload-config-sw";
import { CreateVenueUseCase } from "./use-case-create-venue";
import { handleErrors } from "../../../errors/error-handler";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { CreateVenueRequestParams, createVenueRequestSchema } from "../../../zod/venue/create-venue-request-schema";

type VenueUpload = { buffer: Buffer; mimetype: string; originalname: string };

function venueUploads(req: Request): { logo?: VenueUpload; favicon?: VenueUpload } {
    const files = req.files as { file?: VenueUpload[]; favicon?: VenueUpload[] } | undefined;
    return { logo: files?.file?.[0], favicon: files?.favicon?.[0] };
}

function publicObjectUrl(file: VenueUpload) {
    const key = `$${Date.now()}-${randomUUID()}-${file.originalname}`;
    return {
        key,
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
}

class CreateVenueController {
    constructor(private createVenueUseCase: CreateVenueUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateVenueRequestParams = req.body;
            createVenueRequestSchema.parse(body);

            const { userId, organizationId, hasOvernightStay, owners, ...rest } = body;
            const { logo, favicon } = venueUploads(req);

            if (favicon && !favicon.mimetype.startsWith("image/")) {
                throw new HttpBadRequestError("O icone da aba precisa ser uma imagem.");
            }

            const data: {
                hasOvernightStay: boolean;
                owners: string[];
                logoUrl?: string;
                faviconUrl?: string;
            } & typeof rest = {
                hasOvernightStay: hasOvernightStay === "true",
                owners: JSON.parse(owners),
                ...rest,
            };

            if (logo) {
                const uploaded = publicObjectUrl(logo);
                await s3Client.send(new PutObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: uploaded.key,
                    Body: logo.buffer,
                    ContentType: logo.mimetype,
                }));
                data.logoUrl = uploaded.url;
            }

            if (favicon) {
                const uploaded = publicObjectUrl(favicon);
                await s3Client.send(new PutObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: uploaded.key,
                    Body: favicon.buffer,
                    ContentType: favicon.mimetype,
                }));
                data.faviconUrl = uploaded.url;
            }

            const response = await this.createVenueUseCase.execute({
                userId,
                organizationId,
                data,
            });

            return resp.status(201).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateVenueController };
