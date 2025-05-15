
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { GetByEmailUserRequestParamSchema } from "../../../zod/user/get-by-email-user-param-schema";

class GetByEmailUserUseCase {
    constructor(private userRepository: UserRepositoryInterface) { }

    async execute({ email }: GetByEmailUserRequestParamSchema) {

        // Valemailate if user exists
        const user = await this.userRepository.getByEmail(email)

        if (!user) {
            throw new HttpResourceNotFoundError("Usuario nao encontrado")
        }
        //

        const getByEmailUser = await this.userRepository.getByEmail(email)

        const formatedResponse = {
            success: true,
            message: `Usuario encontrado com sucesso`,
            data: getByEmailUser,
            count: 1,
            type: "User"
        }

        return formatedResponse
    }
}

export { GetByEmailUserUseCase }
