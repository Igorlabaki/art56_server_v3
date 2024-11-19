import { hash } from "bcryptjs"

import { GenerateRefreshToken } from "../../../provider/generate-refresh-token"
import { RefreshTokenProvider } from "../../../provider/refresh-token-provider"
import { RegisterUserRequestParams, } from "../../../zod/register-user-params-schema"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface"
import { SessionRepositoryInterface } from "../../../repositories/interface/session-repository-interface"
import { HttpTokenError } from "../../../errors/errors-type/http-token-error"
import dayjs from "dayjs"
import { AccessTokenProvider } from "../../../provider/access-token-provider"

class RegisterUserUseCase {
    constructor(
        private userRepository: UserRepositoryInterface, 
        private sessionRepository: SessionRepositoryInterface
    ) { }

    async execute({ username, password, email }: RegisterUserRequestParams) {

        // Validate if user exists
        const userAlreadyExists = await this.userRepository.getByEmail(email)

        if (userAlreadyExists) {
            throw new HttpConflictError("Usuario")
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
            throw new Error("Erro ao criar o usuario.")
        }

        const accessTokenProvider = new AccessTokenProvider()
        const accessToken = await accessTokenProvider.execute(newUser)

        const generateRefreshToke = new GenerateRefreshToken()
        const refreshToken = await generateRefreshToke.execute(newUser.id)
        //

        if (!refreshToken) {
            throw new HttpTokenError()
        }

         // Create session
         const expiresAt = dayjs.unix(refreshToken.expireIn).toDate();

         const session = await this.sessionRepository.create({
             expiresAt: expiresAt,
             userId: refreshToken.userId,
             refreshTokenId: refreshToken.id,
         })
 
         if (!session) {
             throw new Error()
         }
 
         return { accessToken, session }
    }
}

export { RegisterUserUseCase }