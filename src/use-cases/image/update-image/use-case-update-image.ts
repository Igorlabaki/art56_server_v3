
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { UpdateImageRequestParams } from "../../../zod/image/upload-image-params-schema";
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";

class UpdateImageUseCase {
    constructor(private imageRepository: ImageRepositoryInterface) { }

    async execute(param: UpdateImageRequestParams) {
      
        // Validate if image exists
        const image = await this.imageRepository.getById(param.imageId)

        if (!image) {
            throw new HttpResourceNotFoundError("Imagem")
        }
        //

        const updatedImage = await this.imageRepository.update(param)

        if (!updatedImage) {
            throw new HttpConflictError("Pergunta")
        }

        const formatedResponse = {
            success: true,
            message: `Pergunta atualizado(a) com sucesso`,
            data: {
                ...updatedImage
            },
            count: 1,
            type: "Image"
        }

        return formatedResponse
    }
}

export { UpdateImageUseCase }
