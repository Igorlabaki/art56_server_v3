import { ListPersonRequestQuerySchema } from "../../../zod/person/list-person-query-schema";
import { PersonRepositoryInterface } from "../../../repositories/interface/person-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";

class ListWebPersonsUseCase {
  constructor(private personRepository: PersonRepositoryInterface,private proposalRepository: ProposalRepositoryInterface) { }

  async execute(query: ListPersonRequestQuerySchema) {

    // Validate if person exists
    const proposal = await this.proposalRepository.getById(query.proposalId)

    if (!proposal) {
      throw new HttpResourceNotFoundError("Orcamento")
    }
    //

    const personList = await this.personRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de convidados com ${personList?.length} items`,
      data: {
        proposal: {
          id: proposal.id,
          guestNumber: proposal.guestNumber,
          completeClientName: proposal.completeClientName,
        },
        personList: personList
      },
      count: personList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListWebPersonsUseCase };
