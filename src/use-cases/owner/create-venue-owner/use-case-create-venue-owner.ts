import { CreateVenueOwnerRequestParams } from "../../../zod/owner/create-venue-owner-params-schema"
import { OwnerRepositoryInterface } from "../../../repositories/interface/owner-repository-interface"
import { resolveOwnerData } from "../../../functions/owner-document"
import { OwnerAuthorizer } from "../owner-authorizer"
import { assertOwnerNotDuplicated } from "../owner-duplicate"

class CreateVenueOwnerUseCase {
    constructor(
        private ownerRepository: OwnerRepositoryInterface,
        private authorizer: OwnerAuthorizer,
    ) { }

    async execute(userId: string | undefined, params: CreateVenueOwnerRequestParams) {
        await this.authorizer.assertMember(userId, params.organizationId)
        await this.authorizer.assertVenuesInOrganization([params.venueId], params.organizationId)

        const resolved = resolveOwnerData(null, params)

        await assertOwnerNotDuplicated(this.ownerRepository, {
            organizationId: params.organizationId,
            resolved,
            completeName: params.completeName,
        })

        const createdOwner = await this.ownerRepository.createVenueOwner({ ...params, ...resolved })

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

export { CreateVenueOwnerUseCase }
