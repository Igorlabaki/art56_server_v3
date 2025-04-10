import { ListAttachmentRequestQuerySchema } from "../../../zod/attachment/list-attachment-query-schema";
import { AttachmentRepositoryInterface } from "../../../repositories/interface/attachment-repository-interface";

class ListAttachmentsUseCase {
  constructor(private attachmentRepository: AttachmentRepositoryInterface) { }

  async execute(query: ListAttachmentRequestQuerySchema) {
    const attachmentList = await this.attachmentRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de anexos com ${attachmentList?.length} items`,
      data: {
        attachmentList: attachmentList
      },
      count: attachmentList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListAttachmentsUseCase };
