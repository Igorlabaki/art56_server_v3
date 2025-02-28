import { CreateDocumentDbSchema } from "../../../zod/document/create-document-db-schema";
import { DocumentRepositoryInterface } from "../../../repositories/interface/document-repository-interface";

class CreateDocumentUseCase {
  constructor(private documentRepository: DocumentRepositoryInterface) {}

  async execute(params: CreateDocumentDbSchema) {
    const newDocument = await this.documentRepository.create(params);

    const formatedResponse = {
      success: true,
      message: "Documento foi cadastrado com sucesso",
      data: {
         ...newDocument
      },
      count: 1,
      type: "Document"
  } 

  return formatedResponse
  }
}

export { CreateDocumentUseCase };
