import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { SessionRepositoryInterface } from "../../../repositories/interface/session-repository-interface"

class GetSessionByUserIdUseCase {
    constructor(private sessionRepository: SessionRepositoryInterface) { }

    async execute(userId: string) {
        
        // Validate if session exists
            const session = await this.sessionRepository.getByUserId(userId)

            if (!session) {
                throw new HttpResourceNotFoundError("Sessao")
            }
        //

        return { session }
    }
}

export { GetSessionByUserIdUseCase }
