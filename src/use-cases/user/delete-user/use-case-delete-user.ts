
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class DeleteUserUseCase {
    constructor(private userRepository: UserRepositoryInterface) { }

    async execute(userId: string) {

        // Validate if user exists
        const user = await this.userRepository.getById(userId)

        if (!user) {
            throw new HttpResourceNotFoundError("Usuario")
        }
        //

        const deletedUser = await this.userRepository.delete(userId)

        const formatedResponse = {
            success: true,
            message: `Usuario  ${deletedUser?.username} deletado com sucesso`,
            data: {
                ...deletedUser
            },
            count: 1,
            type: "User"
        }

        return formatedResponse
    }
}

export { DeleteUserUseCase }
