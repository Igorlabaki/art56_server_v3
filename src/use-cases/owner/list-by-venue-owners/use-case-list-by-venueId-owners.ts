import { OwnerRepositoryInterface } from "../../../repositories/interface/owner-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { ListOwnerByVenueIdQuerySchema } from "../../../zod/owner/list-owners-by-venue-params-schema";
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface";

class ListOwnerByVenueIdUseCase {
  constructor(
    private ownerRepository: OwnerRepositoryInterface,
    private venueRepository: VenueRepositoryInterface,
    private organizationRepository: OrganizationRepositoryInterface,
  ) { }

  async execute(params: ListOwnerByVenueIdQuerySchema) {

    const organizationById = await this.organizationRepository.getById({ organizationId: params.organizationId })

    if (!organizationById) {
      throw new HttpResourceNotFoundError("Organizacao")
    }

    const venueById = await this.venueRepository.getById({ venueId: params.venueId })

    if (!venueById) {
      throw new HttpResourceNotFoundError("Locacao")
    }

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
