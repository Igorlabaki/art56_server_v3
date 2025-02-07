import { hash } from "bcryptjs"

import { GenerateRefreshToken } from "../../../provider/generate-refresh-token"
import { RefreshTokenProvider } from "../../../provider/refresh-token-provider"

import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { SessionRepositoryInterface } from "../../../repositories/interface/session-repository-interface"
import { HttpTokenError } from "../../../errors/errors-type/http-token-error"
import { CreateSessionRequestParams } from "../../../zod/auth/create-session-params-schema"
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface"
import { RefreshTokenRepositoryInterface } from "../../../repositories/interface/refresh-token-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class CreateSessionUseCase {
    constructor(
        private userRepository: UserRepositoryInterface,
        private sessionRepository: SessionRepositoryInterface,
        private tokenRpository: RefreshTokenRepositoryInterface,
    ) { }

    async execute({ refreshTokenId, userId,expiresAt }: CreateSessionRequestParams) {

        // Validate if user exists
        const userAlreadyExists = await this.userRepository.getById(userId)

        if (!userAlreadyExists) {
            throw new HttpResourceNotFoundError("User")
        }
        //
        
        // Validate if user exists
        const tokenAlreadyExists = await this.tokenRpository.get(userId)

        if (!tokenAlreadyExists) {
            throw new HttpResourceNotFoundError("Token")
        }
        //

        const createSessionParams: CreateSessionRequestParams = {
            userId,
            expiresAt,
            refreshTokenId,
        }

        // Create session
        const session = await this.sessionRepository.create(createSessionParams)

        if (!session) {
            throw new Error("Erro ao criar a sessao.")
        }

        return { session }
    }
}

export { CreateSessionUseCase }