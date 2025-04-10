import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { AttachmentRepositoryInterface } from "../../../repositories/interface/attachment-repository-interface";
import { CreateAttachemntDbSchema } from "../../../zod/attachment/create-attachment-params-schema";

class CreateAttachmentUseCase {
  constructor(private attachmentRepository: AttachmentRepositoryInterface) {}

  async execute(params: CreateAttachemntDbSchema) {
    const attachmentAlreadyExists = await this.attachmentRepository.verifyIfExists({
      title: params.title,
      venueId: params.venueId
    });

    if(attachmentAlreadyExists){
      throw new HttpConflictError("Esse anexo ja esta cadastrado.")
    }

    const newAttachment = await this.attachmentRepository.create(params);

    const formatedResponse = {
      success: true,
      message: "Anexo foi cadastrado com sucesso",
      data: {
         ...newAttachment
      },
      count: 1,
      type: "Attachment"
  } 

  return formatedResponse
  }
}

export { CreateAttachmentUseCase };
