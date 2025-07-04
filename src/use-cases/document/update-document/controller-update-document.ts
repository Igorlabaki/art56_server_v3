import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { UpdateDocumentUseCase } from "./use-case-update-document";
import { updateDocumentSchema } from "../../../zod/document/update-document-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../../services/upload-config-sw";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { randomUUID } from "crypto";
import { DocumentRepositoryInterface } from "../../../repositories/interface/document-repository-interface";

class UpdateDocumentController {
    constructor(private updateDocumentUseCase: UpdateDocumentUseCase, private documentRepository: DocumentRepositoryInterface) { }
    async handle(req: Request, resp: Response) {
        try {
            console.log("[UpdateDocument] Início do controller");
            const param = updateDocumentSchema.parse(req.body);
            console.log("[UpdateDocument] Body validado:", param);

            console.log("[UpdateDocument] Buscando documento no banco, id:", param.documentId);
            const document = await this.documentRepository.getById(param.documentId);
            console.log("[UpdateDocument] Documento encontrado:", document);
            
            if (!document) {
                console.log("[UpdateDocument] Documento não encontrado");
                throw new HttpResourceNotFoundError("Documento não encontrado");
            }

            let fileUrl = document.imageUrl;

            if (req.file) {
                const fileKeyDelete = document.imageUrl.split("/").pop(); // Pega a chave do arquivo no S3
                console.log("[UpdateDocument] Deletando imagem antiga do S3, key:", fileKeyDelete);
                try {
                    await s3Client.send(
                        new DeleteObjectCommand({
                            Bucket: process.env.AWS_BUCKET_NAME!,
                            Key: fileKeyDelete!,
                        })
                    );
                    console.log("[UpdateDocument] Imagem antiga deletada com sucesso");
                } catch (err) {
                    console.log("[UpdateDocument] Erro ao deletar imagem da aws:", err);
                    throw new HttpConflictError("Erro ao deletar imagem da aws.");
                }

                const fileKeyUpload = `${Date.now()}-${randomUUID()}-${req.file.originalname}`;
                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: fileKeyUpload,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype,
                };
                console.log("[UpdateDocument] Fazendo upload da nova imagem para o S3, key:", fileKeyUpload);
                await s3Client.send(new PutObjectCommand(params));
                console.log("[UpdateDocument] Upload da nova imagem concluído");

                // Atualiza a URL pública do arquivo
                fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKeyUpload}`;
            }

            const {title, documentId} = param
            console.log("[UpdateDocument] Atualizando documento no banco");
            const documentById = await this.updateDocumentUseCase.execute({
                documentId,
                data:{
                    imageUrl: fileUrl,
                    title: title
                }
            });
            console.log("[UpdateDocument] Documento atualizado com sucesso");

            return resp.json(documentById)
        } catch (error) {
            console.log("[UpdateDocument] Erro capturado:", error);
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateDocumentController }
