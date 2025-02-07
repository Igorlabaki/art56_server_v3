import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UpdateOwnerSchema } from "../../../zod/owner/update-owner-params-schema"
import { OwnerRepositoryInterface } from "../../../repositories/interface/owner-repository-interface"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error"

class UpdateOwnerUseCase {
    constructor(private ownerRepository: OwnerRepositoryInterface) { }

    async execute(param: UpdateOwnerSchema) {

        // Validate if owner exists
        const owner = await this.ownerRepository.getById(param.ownerId)

        if (!owner) {
            throw new HttpResourceNotFoundError("Proprietario")
        }
        //

        const updatedOwner = await this.ownerRepository.update(param)

        if (!updatedOwner) {
            throw new HttpConflictError("Organizacao")
        }

        const formatedResponse = {
            success: true,
            message: `Proprietario  ${updatedOwner.completeName} atualizado(a) com sucesso`,
            data: {
                ...updatedOwner
            },
            count: 1,
            type: "Owner"
        }

        return formatedResponse
    }
}

export { UpdateOwnerUseCase }
