import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface"

class GetUserByIdUseCase {
    constructor(private userRepository: UserRepositoryInterface) { }

    async execute(id: string) {
        // Validate if user exists
        const user = await this.userRepository.getById(id)

        if (!user) {
            throw new Error("User not found")
        }
        //

        return { user }
    }
}

export { GetUserByIdUseCase }
