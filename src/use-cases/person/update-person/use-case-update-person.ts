import { UpdatePersonRequestParams } from "../../../zod/person/update-person-params-schema"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { PersonRepositoryInterface } from "../../../repositories/interface/person-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class UpdatePersonUseCase {
    constructor(private personRepository: PersonRepositoryInterface) { }

    async execute(param: UpdatePersonRequestParams) {
        // Validate if person exists
        const person = await this.personRepository.getById(param.personId)

        if (!person) {
            throw new HttpResourceNotFoundError("Persono")
        }
        //

        const updatedPerson = await this.personRepository.update(param)

        if (!updatedPerson) {
            throw new HttpConflictError("Convidado")
        }

        const formatedResponse = {
            success: true,
            message: `Convidado atualizado(a) com sucesso`,
            data: {
                ...updatedPerson
            },
            count: 1,
            type: "Person"
        }

        return formatedResponse
    }
}

export { UpdatePersonUseCase }
