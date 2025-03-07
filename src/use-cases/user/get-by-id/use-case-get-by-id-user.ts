
import { GetByIdUserRequestParamSchema } from "../../../zod/user/get-by-id-user-param-schema";
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";

class GetByIdUserUseCase {
    constructor(private userRepository: UserRepositoryInterface) { }

    async execute({ userId }: GetByIdUserRequestParamSchema) {

        // Validate if user exists
        const user = await this.userRepository.getById(userId)

        if (!user) {
            throw new HttpResourceNotFoundError("Programacao")
        }
        //

        const getByIdUser = await this.userRepository.getById(userId)

        const formatedResponse = {
            success: true,
            message: `Programacao encontrada com sucesso`,
            data: {
                ...getByIdUser
            },
            count: 1,
            type: "User"
        }

        return formatedResponse
    }
}

export { GetByIdUserUseCase }
