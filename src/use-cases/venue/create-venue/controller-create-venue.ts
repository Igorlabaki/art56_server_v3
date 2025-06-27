import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../../services/upload-config-sw";
import { CreateVenueUseCase } from "./use-case-create-venue";
import { handleErrors } from "../../../errors/error-handler";
import { CreateVenueRequestParams, createVenueRequestSchema } from "../../../zod/venue/create-venue-request-schema";


class CreateVenueController {
    constructor(private createVenueUseCase: CreateVenueUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateVenueRequestParams = req.body;
            // Validate the request parms
            createVenueRequestSchema.parse(body);

            const { userId, organizationId,hasOvernightStay,owners, ...rest } = body

            if (req.file) {
                // Gerando um nome único para o arquivo
                const fileKey = `$${Date.now()}-${randomUUID()}-${req.file.originalname}`;

                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: fileKey,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype,
                };

                await s3Client.send(new PutObjectCommand(params));

                // URL pública do arquivo
                const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

                // Salva no banco com a URL da imagem
                const response = await this.createVenueUseCase.execute({
                    userId, organizationId,
                    data: {
                        hasOvernightStay: hasOvernightStay === "true" ? true : false,
                        owners: JSON.parse(owners),
                        ...rest,
                        logoUrl: fileUrl
                    }
                });

                return resp.status(201).json(response);
            }

            // Esperar a execução do caso de uso
            const response = await this.createVenueUseCase.execute({
                userId, organizationId,
                data: {
                    hasOvernightStay: hasOvernightStay === "true" ? true : false,
                    owners: JSON.parse(owners),
                    ...rest,
                }
            });
            // Retornar o token
            return resp.status(201).json(response);

        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);
            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateVenueController };