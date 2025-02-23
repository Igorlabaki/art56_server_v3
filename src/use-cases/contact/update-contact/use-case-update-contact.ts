import { UpdateContactRequestParams } from "../../../zod/contact/update-contact-params-schema"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { ContactRepositoryInterface } from "../../../repositories/interface/contact-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class UpdateContactUseCase {
    constructor(private contactRepository: ContactRepositoryInterface) { }

    async execute(param: UpdateContactRequestParams) {
        // Validate if contact exists
        const contact = await this.contactRepository.getById(param.contactId)

        if (!contact) {
            throw new HttpResourceNotFoundError("Contacto")
        }
        //

        const updatedContact = await this.contactRepository.update(param)

        if (!updatedContact) {
            throw new HttpConflictError("Locacao")
        }

        const formatedResponse = {
            success: true,
            message: `Contacto atualizado(a) com sucesso`,
            data: {
                ...updatedContact
            },
            count: 1,
            type: "Contact"
        }

        return formatedResponse
    }
}

export { UpdateContactUseCase }
