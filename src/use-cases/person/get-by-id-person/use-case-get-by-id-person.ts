
import { GetByIdPersonRequestParamSchema } from "../../../zod/person/get-by-id-person-param-schema";
import { PersonRepositoryInterface } from "../../../repositories/interface/person-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";

class GetByIdPersonUseCase {
    constructor(private personRepository: PersonRepositoryInterface) { }

    async execute({ personId }: GetByIdPersonRequestParamSchema) {

        // Validate if person exists
        const person = await this.personRepository.getById(personId)

        if (!person) {
            throw new HttpResourceNotFoundError("Convidado")
        }
        //

        const getbyiddPerson = await this.personRepository.getById(personId)

        const formatedResponse = {
            success: true,
            message: `Convidado removido com sucesso`,
            data: {
                ...getbyiddPerson
            },
            count: 1,
            type: "Person"
        }

        return formatedResponse
    }
}

export { GetByIdPersonUseCase }
