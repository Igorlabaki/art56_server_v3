import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { CreateServiceRequestParams } from "../../../zod/services/create-service-params-schema"
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface"

class CreateServiceUseCase {
    constructor(
        private serviceRepository: ServiceRepositoryInterface,
    ) { }

    async execute(params: CreateServiceRequestParams) {

        const serviceAlreadyExists = await this.serviceRepository.getByName({name: params.name, venueId: params.venueId})

        if (serviceAlreadyExists) {
            throw new HttpConflictError("Servico")
        }

        // Validate if user exists
        const newService = await this.serviceRepository.create(params)

        if (!newService) {
            throw new HttpConflictError("Servico")
        }
        //

        const formatedResponse = {
            success: true,
            message: "Servico foi registrado com sucesso",
            data: {
                ...newService
            },
            count: 1,
            type: "Service"
        }

        return formatedResponse
    }
}

export { CreateServiceUseCase }