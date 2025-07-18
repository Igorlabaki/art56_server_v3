import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { UpdateImageOrganizationRequestParams } from "../../../zod/image-organization/upload-image-organization-params-schema";

class UpdateImageOrganizationUseCase {
    constructor(private imageRepository: ImageRepositoryInterface) { }

    async execute(param: UpdateImageOrganizationRequestParams) {
      
        // Validate if image exists
        const image = await this.imageRepository.getById(param.imageId)

        if (!image) {
            throw new HttpResourceNotFoundError("Imagem")
        }
        //

        const updatedImage = await this.imageRepository.updateOrganization(param)

        if (!updatedImage) {
            throw new HttpConflictError("Imagem")
        }

        const formatedResponse = {
            success: true,
            message: `Imagem atualizado(a) com sucesso`,
            data: {
                ...updatedImage
            },
            count: 1,
            type: "Image"
        }

        return formatedResponse
    }
}

export { UpdateImageOrganizationUseCase }
