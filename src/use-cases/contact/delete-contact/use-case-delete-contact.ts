
import { DeleteContactRequestParamSchema } from "../../../zod/contact/delete-contact-param-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { ContactRepositoryInterface } from "../../../repositories/interface/contact-repository-interface";

class DeleteContactUseCase {
    constructor(private contactRepository: ContactRepositoryInterface) { }

    async execute({ contactId }: DeleteContactRequestParamSchema) {

        // Validate if contact exists
        const contact = await this.contactRepository.getById(contactId)

        if (!contact) {
            throw new HttpResourceNotFoundError("Contacto")
        }
        //

        const deletedContact = await this.contactRepository.delete(contactId)

        const formatedResponse = {
            success: true,
            message: `Contacto  ${contact.name} deletado com sucesso`,
            data: {
                ...deletedContact
            },
            count: 1,
            type: "Contact"
        }

        return formatedResponse
    }
}

export { DeleteContactUseCase }
