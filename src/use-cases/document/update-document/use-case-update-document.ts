import { UpdateDocumentRequestParams } from "../../../zod/document/update-document-params-schema"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { DocumentRepositoryInterface } from "../../../repositories/interface/document-repository-interface"
import { UpdateDocumentDbSchema } from "../../../zod/document/update-document-db-schema"

class UpdateDocumentUseCase {
    constructor(private documentRepository: DocumentRepositoryInterface) { }

    async execute(param: UpdateDocumentDbSchema) {
      
        // Validate if document exists
        const document = await this.documentRepository.getById(param.documentId)

        if (!document) {
            throw new HttpResourceNotFoundError("Documento")
        }
        //

        const updatedDocument = await this.documentRepository.update(param)

        if (!updatedDocument) {
            throw new HttpConflictError("Documento")
        }

        const formatedResponse = {
            success: true,
            message: `Documento atualizado(a) com sucesso`,
            data: {
                ...updatedDocument
            },
            count: 1,
            type: "Document"
        }

        return formatedResponse
    }
}

export { UpdateDocumentUseCase }
