import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface"

class GetUserByIdUseCase {
    constructor(private userRepository: UserRepositoryInterface) { }

    async execute(id: string) {
        // Validate if user exists
        const user = await this.userRepository.getById(id)

        if (!user) {
            throw new HttpResourceNotFoundError("User")
        }
        //

        return { user }
    }
}

export { GetUserByIdUseCase }
