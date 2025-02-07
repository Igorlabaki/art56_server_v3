

import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { DeleteServiceRequestParamSchema } from "../../../zod/services/delete-service-param-schema"

class DeleteServiceUseCase {
    constructor(private serviceRepository: ServiceRepositoryInterface) { }

    async execute({ serviceId }: DeleteServiceRequestParamSchema) {

        // Validate if service exists
        const service = await this.serviceRepository.getById(serviceId)

        if (!service) {
            throw new HttpResourceNotFoundError("Servico")
        }
        //

        const deletedService = await this.serviceRepository.delete(serviceId)

        const formatedResponse = {
            success: true,
            message: `Servico deletado com sucesso`,
            data: {
                ...deletedService
            },
            count: 1,
            type: "Service"
        }

        return formatedResponse
    }
}

export { DeleteServiceUseCase }
