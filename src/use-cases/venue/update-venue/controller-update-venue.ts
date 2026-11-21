import { Request, Response } from "express"
import { randomUUID } from "crypto";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../../services/upload-config-sw";
import { handleErrors } from "../../../errors/error-handler";
import { UpdateVenueUseCase } from "./use-case-update-venue";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { updateVenueSchemaRequest } from "../../../zod/venue/update-venue-params-schema-db";

type VenueUpload = { buffer: Buffer; mimetype: string; originalname: string };

function venueUploads(req: Request): { logo?: VenueUpload; favicon?: VenueUpload } {
    const files = req.files as { file?: VenueUpload[]; favicon?: VenueUpload[] } | undefined;
    return { logo: files?.file?.[0], favicon: files?.favicon?.[0] };
}

function publicObjectUrl(file: VenueUpload) {
    const key = `${Date.now()}-${randomUUID()}-${file.originalname}`;
    return {
        key,
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
}

class UpdateVenueController {
    constructor(
        private updateVenueUseCase: UpdateVenueUseCase,
        private venueRepository: VenueRepositoryInterface
    ) { }

    async handle(req: Request, resp: Response) {
        try {
            const param = updateVenueSchemaRequest.parse(req.body);
            const { venueId, userId, logoUrl: _logoUrl, hasOvernightStay, owners, isShowOnOrganization, ...rest } = param;
            void _logoUrl;
            const { logo, favicon } = venueUploads(req);

            if (favicon && !favicon.mimetype.startsWith("image/")) {
                throw new HttpBadRequestError("O icone da aba precisa ser uma imagem.");
            }

            const data: typeof rest & {
                owners?: string[];
                isShowOnOrganization?: boolean;
                hasOvernightStay?: boolean;
                logoUrl?: string;
                faviconUrl?: string;
            } = {
                ...rest,
                owners: owners ? JSON.parse(owners) : undefined,
                isShowOnOrganization: isShowOnOrganization === "true" ? true : isShowOnOrganization === "false" ? false : undefined,
                hasOvernightStay: hasOvernightStay === "true" ? true : hasOvernightStay === "false" ? false : undefined,
            };

            let previousFaviconKey: string | undefined;

            if (logo || favicon) {
                const currentVenue = await this.venueRepository.getById({ venueId });

                if (logo) {
                    if (currentVenue?.logoUrl) {
                        const fileKeyDelete = currentVenue.logoUrl.split("/").pop();
                        const imageDeleted = await s3Client.send(
                            new DeleteObjectCommand({
                                Bucket: process.env.AWS_BUCKET_NAME!,
                                Key: fileKeyDelete!,
                            })
                        );
                        if (!imageDeleted) {
                            throw new HttpConflictError("Erro ao deletar imagem da aws.");
                        }
                    }

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
                    const previousKey = currentVenue?.faviconUrl?.split("/").pop();
                    if (previousKey && previousKey !== uploaded.key) previousFaviconKey = previousKey;
                }
            }

            const response = await this.updateVenueUseCase.execute({
                venueId,
                userId,
                data,
            });

            if (previousFaviconKey) {
                try {
                    await s3Client.send(new DeleteObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME!,
                        Key: previousFaviconKey,
                    }));
                } catch {
                    // A URL nova ja foi gravada. O objeto antigo pode ficar.
                }
            }

            return resp.json(response);
        } catch (error) {
            console.log("error", error)
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateVenueController }
