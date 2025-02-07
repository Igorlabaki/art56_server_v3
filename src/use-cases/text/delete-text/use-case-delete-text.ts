
import { DeleteTextRequestParamSchema } from "../../../zod/text/delete-text-param-schema"
import { TextRepositoryInterface } from "../../../repositories/interface/text-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class DeleteTextUseCase {
    constructor(private textRepository: TextRepositoryInterface) { }

    async execute({ textId }: DeleteTextRequestParamSchema) {

        // Validate if text exists
        const text = await this.textRepository.getById(textId)

        if (!text) {
            throw new HttpResourceNotFoundError("Texto")
        }
        //

        const deletedText = await this.textRepository.delete(textId)

        const formatedResponse = {
            success: true,
            message: `Texto  ${text.title} deletado com sucesso`,
            data: {
                ...deletedText
            },
            count: 1,
            type: "Text"
        }

        return formatedResponse
    }
}

export { DeleteTextUseCase }
