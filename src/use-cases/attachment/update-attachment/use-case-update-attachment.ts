import { UpdateAttachmentRequestParams } from "../../../zod/attachment/update-attachment-params-schema"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { AttachmentRepositoryInterface } from "../../../repositories/interface/attachment-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class UpdateAttachmentUseCase {
    constructor(private attachmentRepository: AttachmentRepositoryInterface) { }

    async execute(param: UpdateAttachmentRequestParams) {

        // Validate if attachment exists
        const attachment = await this.attachmentRepository.getById(param.attachmentId)

        if (!attachment) {
            throw new HttpResourceNotFoundError("Anexo")
        }
        //

        const attachmentAlreadyExists = await this.attachmentRepository.verifyIfExists({
            title:param.data.title,
            venueId: param.data.venueId
        });

        if (attachmentAlreadyExists) {
            throw new HttpConflictError("Esse anexo ja esta cadastrado.")
        }

        const updatedAttachment = await this.attachmentRepository.update(param)

        if (!updatedAttachment) {
            throw new HttpConflictError("Anexo")
        }

        const formatedResponse = {
            success: true,
            message: `Anexo atualizado(a) com sucesso`,
            data: {
                ...updatedAttachment
            },
            count: 1,
            type: "Attachment"
        }

        return formatedResponse
    }
}

export { UpdateAttachmentUseCase }
