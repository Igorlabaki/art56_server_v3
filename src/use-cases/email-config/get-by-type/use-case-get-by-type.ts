import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { EmailConfigRepositoryInterface } from "../../../repositories/interface/email-config-repository-interface"
import { GetByTypeRequestQuerySchema } from "../../../zod/email-config/get-by-type-query-schema"


class GetEmailConfigByTypeUseCase {
    constructor(private emailConfigRepository: EmailConfigRepositoryInterface) { }

    async execute(params: GetByTypeRequestQuerySchema) {

        // ValTypeate if venue exists
        const emailConfig = await this.emailConfigRepository.getByType(params)

        if (!emailConfig) {
            throw new HttpResourceNotFoundError("Email config")
        }
        //

        const formatedResponse = {
            success: true,
            message: `Configuracao de email cadastrada com sucesso`,
            data: emailConfig,
            count: 1,
            type: "Email config"
        }

        return formatedResponse
    }
}

export { GetEmailConfigByTypeUseCase }
