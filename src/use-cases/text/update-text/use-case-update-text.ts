import { UpdateTextRequestParams } from "../../../zod/text/update-text-params-schema"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { TextRepositoryInterface } from "../../../repositories/interface/text-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class UpdateTextUseCase {
    constructor(private textRepository: TextRepositoryInterface) { }

    async execute(param: UpdateTextRequestParams) {
        const { area, position, title } = param.data
        // Validate if text exists
        const text = await this.textRepository.getById(param.textId)

        if (!text) {
            throw new HttpResourceNotFoundError("Texto")
        }
        //

        if (title && area) {
            const validateIfExistTextAreaTitle = await this.textRepository.validateIfExistTextAreaTitle({ area, title,textId: text.id });

            if (validateIfExistTextAreaTitle && title != undefined) {
                throw new HttpConflictError("Texto com esse mesmo titulo")
            }
        }

        if (position && area) {
            const validateIfExistTextAreaPosition = await this.textRepository.validateIfExistTextAreaPosition({ area, position,textId: text.id });

            if (validateIfExistTextAreaPosition) {
                throw new HttpConflictError("Texto nesta area com esta posicao")
            }
        }


        const updatedText = await this.textRepository.update(param)

        if (!updatedText) {
            throw new HttpConflictError("Locacao")
        }

        const formatedResponse = {
            success: true,
            message: `Texto atualizado(a) com sucesso`,
            data: {
                ...updatedText
            },
            count: 1,
            type: "Text"
        }

        return formatedResponse
    }
}

export { UpdateTextUseCase }
