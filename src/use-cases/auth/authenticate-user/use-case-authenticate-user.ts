import { compare } from "bcryptjs"
import { GenerateRefreshToken } from "../../../provider/generate-refresh-token"
import { RefreshTokenProvider } from "../../../provider/refresh-token-provider"
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { HttpInvalidCredentialsError } from "../../../errors/errors-type/http-invalid-credentials-error"
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface"
import { SessionRepositoryInterface } from "../../../repositories/interface/session-repository-interface"
import { HttpTokenError } from "../../../errors/errors-type/http-token-error"
import { AccessTokenProvider } from "../../../provider/access-token-provider"
import dayjs from "dayjs"

interface IRequest {
    password: string,
    email: string
}

class AuthenticateUserUseCase {

    constructor(
        private userRepository: UserRepositoryInterface,
        private sessionRepository: SessionRepositoryInterface
    ) { }

    async execute({ password, email }: IRequest) {
        // Validate if user exists
        const userAlreadyExists = await this.userRepository.getByEmail(email)

        if (!userAlreadyExists) {
            throw new HttpResourceNotFoundError("User")
        }
        //

        // Validate if password is correct
        const passwordMatch = await compare(password, userAlreadyExists.password)

        if (!passwordMatch) {
            throw new HttpInvalidCredentialsError()
        }
        //

        // Provide token to user
        const accessTokenProvider = new AccessTokenProvider()
        const accessToken = await accessTokenProvider.execute({
            id:userAlreadyExists.id,
            email:userAlreadyExists.email,
            username:userAlreadyExists.username,
        })

        const generateRefreshToke = new GenerateRefreshToken()
        const refreshToken = await generateRefreshToke.execute(userAlreadyExists.id)
        //

        if (!refreshToken) {
            throw new HttpTokenError()
        }

        // Create session
        const expiresAt = dayjs().add(refreshToken.expireIn, 'days').toDate()
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

export { AuthenticateUserUseCase }