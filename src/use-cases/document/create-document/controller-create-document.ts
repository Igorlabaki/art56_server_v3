import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../../services/upload-config-sw";
import { CreateDocumentUseCase } from "./use-case-create-document";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { createDocumentSchema } from "../../../zod/document/create-document-params-schema";
import { DocumentRepositoryInterface } from "../../../repositories/interface/document-repository-interface";
import { fromBuffer } from "pdf2pic";
import { handleErrors } from "../../../errors/error-handler";

class CreateDocumentController {
    constructor(
        private createDocumentUseCase: CreateDocumentUseCase,
        private documentRepository: DocumentRepositoryInterface
    ) { }

 /*    private async generatePdfThumbnail(pdfBuffer: Buffer): Promise<Buffer> {
        try {
            const options = {
                density: 150,  // Densidade para maior qualidade da imagem
                format: 'png', // Formato da imagem
                width: 800,    // Largura da miniatura
                height: 1100,  // Altura da miniatura
                quality: 100,  // Qualidade máxima
            };

            const converter = fromBuffer(pdfBuffer, options);
            const result = await converter(1, { responseType: 'buffer' });

            if (!result || !result.buffer) {
                throw new Error('Falha ao gerar a miniatura');
            }

            return result.buffer; // Retorna o buffer da miniatura gerada
        } catch (error) {
            console.error("Erro na geração de thumbnail:", error);
            throw new Error("Não foi possível gerar a miniatura do PDF");
        }
    } */

    async handle(req: Request, resp: Response) {
        try {
            const body = req.body

            if (!req.file) {
                throw new HttpResourceNotFoundError("Documento");
            }

          /*   const documentAlreadyExists = await this.documentRepository.getDocumentByTitle(body.);
            if (documentAlreadyExists) {
                throw new HttpConflictError("Já existe um documento com esse nome.");
            }
 */
            // Upload do arquivo principal
            const fileKey = `${Date.now()}-${randomUUID()}-${req.file.originalname}`;
            await s3Client.send(new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: fileKey,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            }));

            let thumbnailUrl: string | undefined = undefined;
            let fileType: "PDF" | "IMAGE" = "IMAGE";

            // Se for um PDF, gerar a miniatura
            if (req.file.mimetype === "application/pdf") {
                fileType = "PDF";
            }

            // URL do arquivo original
            const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

            // Criar documento no banco de dados
            const response = await this.createDocumentUseCase.execute({
                ...body,
                imageUrl: fileUrl, // URL do arquivo original
                fileType,
                thumbnailUrl, // URL da miniatura
            });

            return resp.status(201).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateDocumentController };
