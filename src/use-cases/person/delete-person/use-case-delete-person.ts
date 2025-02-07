
import { DeletePersonRequestParamSchema } from "../../../zod/person/delete-person-param-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { PersonRepositoryInterface } from "../../../repositories/interface/person-repository-interface";

class DeletePersonUseCase {
    constructor(private personRepository: PersonRepositoryInterface) { }

    async execute({ personId }: DeletePersonRequestParamSchema) {

        // Validate if person exists
        const person = await this.personRepository.getById(personId)

        if (!person) {
            throw new HttpResourceNotFoundError("Persono")
        }
        //

        const deletedPerson = await this.personRepository.delete(personId)

        const formatedResponse = {
            success: true,
            message: `Convidado removido com sucesso`,
            data: {
                ...deletedPerson
            },
            count: 1,
            type: "Person"
        }

        return formatedResponse
    }
}

export { DeletePersonUseCase }
