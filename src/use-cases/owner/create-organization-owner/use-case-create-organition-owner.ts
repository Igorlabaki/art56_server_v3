import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { CreateOrganizationOwnerRequestParams } from "../../../zod/owner/create-owner-params-schema"
import { OwnerRepositoryInterface } from "../../../repositories/interface/owner-repository-interface"

class CreateOrganizationOwnerUseCase {
    constructor(
        private ownerRepository: OwnerRepositoryInterface,
    ) { }

    async execute(params: CreateOrganizationOwnerRequestParams) {

        // Validate if user exists
        const ownerAlreadyExists = await this.ownerRepository.vefiryIfOwnerExists(params.completeName)

        if (ownerAlreadyExists) {
            throw new HttpConflictError("Owner")
        }
        //

        const createdOwner = await this.ownerRepository.createOrganizationOwner(params)

        const formatedResponse = {
            success: true,
            message: `Proprietario criado com sucesso`,
            data:{
              ...createdOwner
            },
            count: 1,
            type: "Owner"
        }

        return formatedResponse
    }
}

export { CreateOrganizationOwnerUseCase }