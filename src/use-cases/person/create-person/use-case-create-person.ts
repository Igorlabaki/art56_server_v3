import { Person } from "@prisma/client";
import { HttpStandartError } from "../../../errors/errors-type/htttp-standart-error";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { CreatePersonRequestParams } from "../../../zod/person/create-person-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { PersonRepositoryInterface } from "../../../repositories/interface/person-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";

class CreatePersonUseCase {
  constructor(
    private personRepository: PersonRepositoryInterface,
    private proposalRepository: ProposalRepositoryInterface,
  ) {}

  async execute(params: CreatePersonRequestParams) {

    const proposal = await this.proposalRepository.getById(params.proposalId);

    if(!proposal){
      throw new HttpResourceNotFoundError("Orcamento")
    }

    if(proposal.personList.filter((item:Person) => item.type === "GUEST") .length === proposal.guestNumber){
      throw new HttpStandartError("Nao ha mais vaga na lista de convidados")
    }

    const newPerson = await this.personRepository.create(params);

    if(!newPerson){
      throw new HttpBadRequestError("Convidado")
    }

    const formatedResponse = {
      success: true,
      message: "Convidado foi criada com sucesso",
      data: {
         ...newPerson
      },
      count: 1,
      type: "Person"
  } 

  return formatedResponse
  }
}

export { CreatePersonUseCase };
