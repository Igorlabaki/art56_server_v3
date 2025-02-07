import { DeleteOwnerSchema } from "../../../zod/owner/delete-owner-params-schema"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { OwnerRepositoryInterface } from "../../../repositories/interface/owner-repository-interface"

class DeleteOwnerUseCase {
    constructor(private ownerRepository: OwnerRepositoryInterface) { }

    async execute(param: DeleteOwnerSchema) {

        // Validate if owner exists
        const owner = await this.ownerRepository.getById(param.ownerId)

        if (!owner) {
            throw new HttpResourceNotFoundError("Proprietario")
        }
        //

        const deletedOwner = await this.ownerRepository.delete(param.ownerId)

        const formatedResponse = {
            success: true,
            message: `Proprietario  ${owner.completeName} deletado(a) com sucesso`,
            data: {
                ...deletedOwner
            },
            count: 1,
            type: "Owner"
        }

        return formatedResponse
    }
}

export { DeleteOwnerUseCase }
