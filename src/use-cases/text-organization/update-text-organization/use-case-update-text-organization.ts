import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { TextRepositoryInterface } from "../../../repositories/interface/text-repository-interface"
import { UpdateTextOrganizationSchema } from "../../../zod/text-organization/update-text-organization-params-schema"

class UpdateTextOrganizationUseCase {
    constructor(private textRepositoryInterface: TextRepositoryInterface) { }

    async execute(param: UpdateTextOrganizationSchema) {
        const { area, position, title } = param.data
        // Validate if textorganization exists
        const textorganization = await this.textRepositoryInterface.getById(param.textId)

        if (!textorganization) {
            throw new HttpResourceNotFoundError("TextOrganizationo")
        }
        //

        if (title && area) {
            const validateIfExistTextOrganizationAreaTitle = await this.textRepositoryInterface.validateIfExistTextAreaTitle(
                { area, title,textId: textorganization.id, organizationId: param.organizaitonId }
            );

            if (validateIfExistTextOrganizationAreaTitle && title != undefined) {
                throw new HttpConflictError("TextOrganizationo com esse mesmo titulo")
            }
        }

        if (position && area) {
            const validateIfExistTextOrganizationAreaPosition = await this.textRepositoryInterface.validateIfExistTextAreaPosition(
                { area, position,textId: textorganization.id, organizationId: param.organizaitonId }
            );

            if (validateIfExistTextOrganizationAreaPosition) {
                throw new HttpConflictError("TextOrganizationo nesta area com esta posicao")
            }
        }

        const updatedTextOrganization = await this.textRepositoryInterface.updateTextOrganization(param)

        if (!updatedTextOrganization) {
            throw new HttpConflictError("Locacao")
        }

        const formatedResponse = {
            success: true,
            message: `Texto atualizado(a) com sucesso`,
            data: {
                ...updatedTextOrganization
            },
            count: 1,
            type: "Text"
        }

        return formatedResponse
    }
}

export { UpdateTextOrganizationUseCase }
