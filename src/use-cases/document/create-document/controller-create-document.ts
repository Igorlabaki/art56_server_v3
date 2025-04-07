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
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";

class CreateDocumentController {
    constructor(private createDocumentUseCase: CreateDocumentUseCase, private documentRepository: DocumentRepositoryInterface) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateDocumentRequestParams = req.body;
            
            // Validação dos parâmetros da requisição
            const validation = createDocumentSchema.safeParse(body);
            if (!validation.success) {
                throw new HttpBadRequestError("Dados inválidos");
            }

            if (!req.file) {
                throw new HttpBadRequestError("Nenhum arquivo enviado");
            }

            // Validação do tipo de arquivo (aceita PDF e imagens)
            const allowedMimeTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp'
            ];

            if (!allowedMimeTypes.includes(req.file.mimetype)) {
                throw new HttpBadRequestError(
                    "Tipo de arquivo não suportado. Envie um PDF ou imagem (JPEG, PNG, GIF, WEBP)"
                );
            }

            // Validação do tamanho do arquivo (opcional - 2.5MB máximo)
            const maxSize = 2.5 * 1024 * 1024; // 2.5MB
            if (req.file.size > maxSize) {
                throw new HttpBadRequestError(
                    "Arquivo muito grande. Tamanho máximo permitido: 2.5MB"
                );
            }

            // Verifica se já existe documento com o mesmo título
            const documentAlreadyExists = await this.documentRepository.getDocumentByTitle(body.title);
            if (documentAlreadyExists) {
                throw new HttpConflictError("Já existe um documento com este nome.");
            }

            // Mantém a extensão original do arquivo
            const fileExtension = req.file.originalname.split('.').pop();
            const fileKey = `${Date.now()}-${randomUUID()}.${fileExtension}`;

            // Upload para o S3
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: fileKey,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            };

            await s3Client.send(new PutObjectCommand(params));

            // URL pública do arquivo
            const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

            // Cria o documento no banco de dados
            const { imageUrl, ...rest } = body;
            const response = await this.createDocumentUseCase.execute({ 
                imageUrl: fileUrl, 
                ...rest 
            });

            return resp.status(201).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateDocumentController };
