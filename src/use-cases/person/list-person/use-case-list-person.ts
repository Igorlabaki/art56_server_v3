import { ListPersonRequestQuerySchema } from "../../../zod/person/list-person-query-schema";
import { PersonRepositoryInterface } from "../../../repositories/interface/person-repository-interface";

class ListPersonsUseCase {
  constructor(private personRepository: PersonRepositoryInterface) { }

  async execute(query: ListPersonRequestQuerySchema) {
    const personList = await this.personRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de convidados com ${personList?.length} items`,
      data: {
        personList: personList
      },
      count: personList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListPersonsUseCase };
