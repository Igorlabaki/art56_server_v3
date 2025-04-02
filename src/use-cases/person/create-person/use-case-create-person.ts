import { Person } from "@prisma/client";
import { HttpStandartError } from "../../../errors/errors-type/htttp-standart-error";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { CreatePersonRequestParams } from "../../../zod/person/create-person-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { PersonRepositoryInterface } from "../../../repositories/interface/person-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { SendAttendeceConfirmationEmailCase } from "../../email/send-attendence-confirmation-to-email/use-case-send-attendence-confirmation-to-email";

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

    if(proposal.personList.filter((item:Person) => item.type === "GUEST").length === proposal.guestNumber){
      throw new HttpStandartError("Nao ha mais vaga na lista de convidados")
    }

    const newPerson = await this.personRepository.create(params);

    if(!newPerson){
      throw new HttpBadRequestError("Convidado")
    }

    if(newPerson.type === "GUEST" && newPerson.email  && params.venueInfo){
      const sendAttendeceConfirmationEmailCase = new SendAttendeceConfirmationEmailCase();
      await sendAttendeceConfirmationEmailCase.execute({
        guest:{
          id: newPerson.id,
          name: newPerson.name,
          email: newPerson.email,
        },
        proposal:{
          proposalId: proposal.id,
          endDate: proposal.endDate,
          startDate: proposal.startDate,
          hostMessage: proposal?.hostMessage,
          clientName: proposal.completeClientName,
        },
        venue:{
          city: params.venueInfo.city,
          state: params.venueInfo.state,
          street: params.venueInfo.street,
          name: params.venueInfo.name,
          email: params.venueInfo.email,
          neighborhood: params.venueInfo.neighborhood,
          streetNumber: params.venueInfo.streetNumber,
        },
      })
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
