import { hash } from "bcryptjs"


import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UpdateUserRequestParams } from "../../../zod/user/update-user-params-schema"

class UpdateUserCase {

    constructor(
        private userRepository: UserRepositoryInterface,
    ) { }

    async execute({ userId, ...rest }: UpdateUserRequestParams) {

        // Validate if user exists
        const userAlreadyExists = await this.userRepository.getById(userId)

        if (!userAlreadyExists) {
            throw new HttpResourceNotFoundError("Usuario")
        }
        //

        // Update user
        const updatedUser = await this.userRepository.update({ userId, ...rest })
        //

        if (!updatedUser) {
            throw new HttpResourceNotFoundError("Porra")
        }
        //

        const formatedResponse = {
            success: true,
            message: `Usuario ${updatedUser?.username} foi atualizado com sucesso`,
            data: {
                user: updatedUser
            },
            type: "USER"
        }


        return formatedResponse
    }
}

export { UpdateUserCase }