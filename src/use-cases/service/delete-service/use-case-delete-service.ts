import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { DeleteServiceRequestParamSchema } from "../../../zod/services/delete-service-param-schema"
import { ServiceAuthorizer } from "../service-authorizer"

class DeleteServiceUseCase {
    constructor(
        private serviceRepository: ServiceRepositoryInterface,
        private authorizer: ServiceAuthorizer,
    ) { }

    async execute(userId: string | undefined, { serviceId }: DeleteServiceRequestParamSchema) {
        const service = await this.serviceRepository.getById(serviceId)

        if (!service) {
            throw new HttpResourceNotFoundError("Servico")
        }

        await this.authorizer.assert(userId, service.venueId)

        const deletedService = await this.serviceRepository.delete(serviceId)

        return {
            success: true,
            message: `Servico deletado com sucesso`,
            data: {
                ...deletedService
            },
            count: 1,
            type: "Service"
        }
    }
}

export { DeleteServiceUseCase }
