import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { ListPermittedVenueRequestQuerySchema } from "../../../zod/venue/list-venue-permitted-query-schema";

class ListPermittedVenuesUseCase {
  constructor(private venueRepository: VenueRepositoryInterface) { }

  async execute(query: ListPermittedVenueRequestQuerySchema) {
    const venueList = await this.venueRepository.listPermitted(query);

    const formatedResponse = {
      success: true,
      message: `Lista de locacoes com ${venueList?.length} items`,
      data: {
        venueList: venueList
      },
      count: venueList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListPermittedVenuesUseCase };
