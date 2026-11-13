import { OwnerRepositoryInterface } from "../../../repositories/interface/owner-repository-interface";
import { ListOwnerByVenueIdQuerySchema } from "../../../zod/owner/list-owners-by-venue-params-schema";
import { OwnerAuthorizer } from "../owner-authorizer";

class ListOwnerByVenueIdUseCase {
  constructor(
    private ownerRepository: OwnerRepositoryInterface,
    private authorizer: OwnerAuthorizer,
  ) { }

  async execute(userId: string | undefined, params: ListOwnerByVenueIdQuerySchema) {
    await this.authorizer.assertMember(userId, params.organizationId)
    await this.authorizer.assertVenuesInOrganization([params.venueId], params.organizationId)

    const ownerByVenueList = await this.ownerRepository.listByVenue(params);

    const formatedResponse = {
      success: true,
      message: `Lista de propoietarios com ${ownerByVenueList?.length} items`,
      data:{
        ownerByVenueList: ownerByVenueList
      },
      count: ownerByVenueList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListOwnerByVenueIdUseCase };
