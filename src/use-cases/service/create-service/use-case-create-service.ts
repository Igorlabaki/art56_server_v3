import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { CreateServiceRequestParams } from "../../../zod/services/create-service-params-schema"
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface"

class CreateServiceUseCase {
    constructor(
        private serviceRepository: ServiceRepositoryInterface,
    ) { }

    async execute(params: CreateServiceRequestParams) {

        // Validate if user exists
        const serviceAlreadyExists = await this.serviceRepository.create(params)

        if (!serviceAlreadyExists) {
            throw new HttpConflictError("Service")
        }
        //

        return { serviceAlreadyExists }
    }
}

export { CreateServiceUseCase }