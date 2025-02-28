import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { UpdateDocumentUseCase } from "./use-case-update-document";
import { updateDocumentSchema } from "../../../zod/document/update-document-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../../service/upload-config-sw";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { randomUUID } from "crypto";
import { DocumentRepositoryInterface } from "../../../repositories/interface/document-repository-interface";

class UpdateDocumentController {
    constructor(private updateDocumentUseCase: UpdateDocumentUseCase, private documentRepository: DocumentRepositoryInterface) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateDocumentSchema.parse(req.body);

            if (!req.file) {
                return new HttpResourceNotFoundError("Documento")
            }

            const fileKeyDelete = param.data.imageUrl.split("/").pop(); // Pega a chave do arquivo no S3

            const imageDeleted = await s3Client.send(
                new DeleteObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: fileKeyDelete!,
                })
            );

            if (!imageDeleted) {
                throw new HttpConflictError("Erro ao deletar imagem da aws.");
            }

            const fileKeyUpload = `${Date.now()}-${randomUUID()}-${req.file.originalname}`;

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: fileKeyUpload,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            };

            await s3Client.send(new PutObjectCommand(params));

            // URL pública do arquivo
            const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKeyUpload}`;
            const {data,documentId} = param

            const documentById = await this.updateDocumentUseCase.execute({
                documentId,
                data:{
                    imageUrl: fileUrl,
                    title: data.title
                }
            });

            return resp.json(documentById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateDocumentController }
