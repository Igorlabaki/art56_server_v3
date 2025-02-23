import { ListContactRequestQuerySchema } from "../../../zod/contact/list-contact-query-schema";
import { ContactRepositoryInterface } from "../../../repositories/interface/contact-repository-interface";

class ListContactsUseCase {
  constructor(private contactRepository: ContactRepositoryInterface) { }

  async execute(query: ListContactRequestQuerySchema) {
    const contactList = await this.contactRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de contactos com ${contactList?.length} items`,
      data: {
        contactList: contactList
      },
      count: contactList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListContactsUseCase };
