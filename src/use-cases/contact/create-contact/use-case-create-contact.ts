
import { CreateContactRequestParams } from "../../../zod/contact/create-contact-params-schema";
import { ContactRepositoryInterface } from "../../../repositories/interface/contact-repository-interface";

class CreateContactUseCase {
  constructor(private contactRepository: ContactRepositoryInterface) {}

  async execute(params : CreateContactRequestParams) {

    const newContact = await this.contactRepository.create(params);

    const formatedResponse = {
      success: true,
      message: "Contacto foi criada com sucesso",
      data: {
         ...newContact
      },
      count: 1,
      type: "Contact"
  } 

  return formatedResponse
  }
}

export { CreateContactUseCase };
