
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { UpdateServiceRequestParams } from "../../../zod/services/update-service-params-schema"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface"

class UpdateServiceUseCase {
    constructor(private serviceRepository: ServiceRepositoryInterface) { }

    async execute(param: UpdateServiceRequestParams) {
        // Validate if service exists
        const service = await this.serviceRepository.getById(param.serviceId)

        if (!service) {
            throw new HttpResourceNotFoundError("Servico")
        }
        //

        const updatedService = await this.serviceRepository.update(param)

        if (!updatedService) {
            throw new HttpConflictError("Servico")
        }

        const formatedResponse = {
            success: true,
            message: `Servico atualizado(a) com sucesso`,
            data: {
                ...updatedService
            },
            count: 1,
            type: "Service"
        }

        return formatedResponse
    }
}

export { UpdateServiceUseCase }
