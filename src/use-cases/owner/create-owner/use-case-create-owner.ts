import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { CreateOwnerRequestParams } from "../../../zod/owner/create-owner-params-schema"
import { OwnerRepositoryInterface } from "../../../repositories/interface/owner-repository-interface"

class CreateOwnerUseCase {
    constructor(
        private ownerRepository: OwnerRepositoryInterface,
    ) { }

    async execute(params: CreateOwnerRequestParams) {

        // Validate if user exists
        const ownerAlreadyExists = await this.ownerRepository.create(params)

        if (!ownerAlreadyExists) {
            throw new HttpConflictError("Owner")
        }
        //

        return { ownerAlreadyExists }
    }
}

export { CreateOwnerUseCase }