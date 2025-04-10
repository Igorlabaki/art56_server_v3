
import { DeleteAttachmentRequestParamSchema } from "../../../zod/attachment/delete-attachment-param-schema"
import { AttachmentRepositoryInterface } from "../../../repositories/interface/attachment-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class DeleteAttachmentUseCase {
    constructor(private attachmentRepository: AttachmentRepositoryInterface) { }

    async execute({ attachmentId }: DeleteAttachmentRequestParamSchema) {

        // Validate if attachment exists
        const attachment = await this.attachmentRepository.getById(attachmentId)

        if (!attachment) {
            throw new HttpResourceNotFoundError("Anexo")
        }
        //

        const deletedAttachment = await this.attachmentRepository.delete(attachmentId)

        const formatedResponse = {
            success: true,
            message: `Anexo deletado com sucesso`,
            data: {
                ...deletedAttachment
            },
            count: 1,
            type: "Attachment"
        }

        return formatedResponse
    }
}

export { DeleteAttachmentUseCase }
