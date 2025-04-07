import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { handleErrors } from "../../../errors/error-handler";
import { s3Client } from "../../../service/upload-config-sw";
import { CreateDocumentUseCase } from "./use-case-create-document";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { DocumentRepositoryInterface } from "../../../repositories/interface/document-repository-interface";
import { CreateDocumentRequestParams, createDocumentSchema } from "../../../zod/document/create-document-params-schema";

class CreateDocumentController {
    constructor(private createDocumentUseCase: CreateDocumentUseCase, private documentRepository: DocumentRepositoryInterface) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateDocumentRequestParams = req.body;
            // Validate the request parms
            createDocumentSchema.safeParse(body);

            if (!req.file) {
                throw new HttpResourceNotFoundError("Documento")
            }

            const documentAlreadyExists = await this.documentRepository.getDocumentByTitle(body.title);

            if (documentAlreadyExists) {
                throw new HttpConflictError("Ja existe um documento com esta nome.")
            }

            const fileKey = `${Date.now()}-${randomUUID()}-${req.file.originalname}`;

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: fileKey,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            };

            await s3Client.send(new PutObjectCommand(params));

            // URL pública do arquivo
            const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

            const { imageUrl, ...rest } = body
            // Esperar a execução do caso de uso
            const response = await this.createDocumentUseCase.execute({ imageUrl: fileUrl, ...rest });
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

export { CreateDocumentController };
