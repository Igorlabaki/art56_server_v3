import { CreateOrganizationOwnerRequestParams } from "../../../zod/owner/create-owner-params-schema"
import { OwnerRepositoryInterface } from "../../../repositories/interface/owner-repository-interface"
import { resolveOwnerData } from "../../../functions/owner-document"
import { OwnerAuthorizer } from "../owner-authorizer"
import { assertOwnerNotDuplicated } from "../owner-duplicate"

class CreateOrganizationOwnerUseCase {
    constructor(
        private ownerRepository: OwnerRepositoryInterface,
        private authorizer: OwnerAuthorizer,
    ) { }

    async execute(userId: string | undefined, params: CreateOrganizationOwnerRequestParams) {
        await this.authorizer.assertMember(userId, params.organizationId)
        await this.authorizer.assertVenuesInOrganization(params.venueIds, params.organizationId)

        const resolved = resolveOwnerData(null, params)

        await assertOwnerNotDuplicated(this.ownerRepository, {
            organizationId: params.organizationId,
            resolved,
            completeName: params.completeName,
        })

        const createdOwner = await this.ownerRepository.createOrganizationOwner({ ...params, ...resolved })

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
