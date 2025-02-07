import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { ListVenueRequestQuerySchema } from "../../../zod/venue/list-venue-query-schema";

class ListVenuesUseCase {
  constructor(private venueRepository: VenueRepositoryInterface) { }

  async execute(query: ListVenueRequestQuerySchema) {
    const venueList = await this.venueRepository.list(query);

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

export { ListVenuesUseCase };
