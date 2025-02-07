import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";

import { ListProposalRequestQuerySchema } from "../../../zod/proposal/list-proposal-query-schema";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";

class ListProposalUseCase {
  constructor(private proposalRepository: ProposalRepositoryInterface, private venueRepository: VenueRepositoryInterface) { }

  async execute(params: ListProposalRequestQuerySchema) {

    const userById = await this.venueRepository.getById({venueId: params.venueId})

    if(!userById){
      throw new HttpResourceNotFoundError("Usuario")
    }

    const proposalList = await this.proposalRepository.list(params);

    const formatedResponse = {
      success: true,
      message: `Lista de orcamentos com ${proposalList?.length} items`,
      data: {
        proposalList: proposalList
      },
      count: proposalList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListProposalUseCase };
