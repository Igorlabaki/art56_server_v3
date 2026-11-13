import { ListOwnerQuerySchema } from "../../../zod/owner/list-owner-params-schema";
import { OwnerRepositoryInterface } from "../../../repositories/interface/owner-repository-interface";
import { OwnerAuthorizer } from "../owner-authorizer";

class ListOwnerUseCase {
  constructor(private ownerRepository: OwnerRepositoryInterface, private authorizer: OwnerAuthorizer) { }

  async execute(userId: string | undefined, params: ListOwnerQuerySchema) {
    await this.authorizer.assertMember(userId, params.organizationId)

    const ownerList = await this.ownerRepository.list(params);

    const formatedResponse = {
      success: true,
      message: `Lista de proprietarios com ${ownerList?.length} items`,
      data: {
        ownerByOrganizationList: ownerList
      },
      count: ownerList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListOwnerUseCase };
