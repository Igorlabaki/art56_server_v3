import { DocumentRepositoryInterface } from "../../../repositories/interface/document-repository-interface";
import { ListDocumentRequestQuerySchema } from "../../../zod/document/list-document-query-schema";
class ListDocumentsUseCase {
  constructor(private documentRepository: DocumentRepositoryInterface) { }

  async execute(query: ListDocumentRequestQuerySchema) {
    const documentList = await this.documentRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de documentos com ${documentList?.length} items`,
      data: {
        documentList: documentList
      },
      count: documentList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListDocumentsUseCase };
