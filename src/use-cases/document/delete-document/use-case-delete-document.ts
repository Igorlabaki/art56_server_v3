
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../../service/upload-config-sw";
import { DeleteDocumentRequestParamSchema } from "../../../zod/document/delete-document-param-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { DocumentRepositoryInterface } from "../../../repositories/interface/document-repository-interface";

class DeleteDocumentUseCase {
    constructor(private documentRepository: DocumentRepositoryInterface) { }

    async execute({ documentId }: DeleteDocumentRequestParamSchema) {

        // Validate if document exists
        const document = await this.documentRepository.getById(documentId)

        if (!document) {
            throw new HttpResourceNotFoundError("Pergunta")
        }
        //

        const deletedDocument = await this.documentRepository.delete(documentId)

        const fileKey = deletedDocument?.imageUrl.split("/").pop(); // Pega a chave do arquivo no S3
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: fileKey!,
            })
        );

        const formatedResponse = {
            success: true,
            message: `Documento deletado com sucesso`,
            data: {
                ...deletedDocument
            },
            count: 1,
            type: "Document"
        }

        return formatedResponse
    }
}

export { DeleteDocumentUseCase }
