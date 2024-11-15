import { hash } from "bcryptjs"

import { GenerateRefreshToken } from "../../../provider/generate-refresh-token"
import { RefreshTokenProvider } from "../../../provider/refresh-token-provider"
import { RegisterUserRequestParams, } from "../../../zod/registerUserParamsSchema"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface"
import { SessionRepositoryInterface } from "../../../repositories/interface/session-repository-interface"
import { HttpTokenError } from "../../../errors/errors-type/http-token-error copy"




class RegisterUserUseCase {
    constructor(
        private userRepository: UserRepositoryInterface, 
        private tokenRepository: RefreshTokenProvider, 
        private sessionRepository: SessionRepositoryInterface
    ) { }

    async execute({ username, password, email }: RegisterUserRequestParams) {

        // Validate if user exists
        const userAlreadyExists = await this.userRepository.getByEmail(email)

        if (userAlreadyExists) {
            throw new HttpConflictError("User")
        }
        //

        // Register new user
        const passwordHash = await hash(password, 8)

        const registerUserParams: RegisterUserRequestParams = {
            email,
            username,
            password: passwordHash,
        }

        const newUser = await this.userRepository.register(registerUserParams)

        if (!newUser) {
            throw new Error()
        }

        const refreshTokenProvider = new RefreshTokenProvider()
        const token = await refreshTokenProvider.execute(newUser)

        const generateRefreshToke = new GenerateRefreshToken()
        const refreshToken = await generateRefreshToke.execute(newUser.id)
        //

        if (!refreshToken) {
            throw new HttpTokenError()
        }

        // Create session
        const session = await this.sessionRepository.create({
            userId: newUser.id,
            refreshTokenId: refreshToken.id,
        })

        if (!session) {
            throw new Error()
        }

        return { token, refreshToken }
    }
}

export { RegisterUserUseCase }