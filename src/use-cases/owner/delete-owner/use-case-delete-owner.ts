import { DeleteOwnerSchema } from "../../../zod/owner/delete-owner-params-schema"
import { OwnerRepositoryInterface } from "../../../repositories/interface/owner-repository-interface"
import { OwnerAuthorizer } from "../owner-authorizer"

class DeleteOwnerUseCase {
    constructor(
        private ownerRepository: OwnerRepositoryInterface,
        private authorizer: OwnerAuthorizer,
    ) { }

    async execute(userId: string | undefined, param: DeleteOwnerSchema) {
        const owner = await this.authorizer.loadOwner(userId, param.ownerId)

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
