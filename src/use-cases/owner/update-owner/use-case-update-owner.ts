import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UpdateOwnerSchema } from "../../../zod/owner/update-owner-params-schema"
import { OwnerRepositoryInterface } from "../../../repositories/interface/owner-repository-interface"
import { resolveOwnerData } from "../../../functions/owner-document"
import { OwnerAuthorizer } from "../owner-authorizer"
import { assertOwnerNotDuplicated } from "../owner-duplicate"

class UpdateOwnerUseCase {
    constructor(
        private ownerRepository: OwnerRepositoryInterface,
        private authorizer: OwnerAuthorizer,
    ) { }

    async execute(userId: string | undefined, param: UpdateOwnerSchema) {
        const owner = await this.authorizer.loadOwner(userId, param.ownerId)

        await this.authorizer.assertVenuesInOrganization(param.data.venueIds, owner.organizationId)

        const resolved = resolveOwnerData(owner, param.data)

        await assertOwnerNotDuplicated(this.ownerRepository, {
            organizationId: owner.organizationId,
            resolved,
            excludeOwnerId: owner.id,
        })

        const updatedOwner = await this.ownerRepository.update({
            ownerId: param.ownerId,
            data: { ...param.data, ...resolved },
        })

        if (!updatedOwner) {
            throw new HttpResourceNotFoundError("Proprietario")
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
