import dayjs from "dayjs"
import { hash } from "bcryptjs"
import { AccessTokenProvider } from "../../../provider/access-token-provider"
import { HttpTokenError } from "../../../errors/errors-type/http-token-error"
import { GenerateRefreshToken } from "../../../provider/generate-refresh-token"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface"
import { RegisterGoogleUserRequestParams } from "../../../zod/auth/register-google-user-params-schema"
import { SessionRepositoryInterface } from "../../../repositories/interface/session-repository-interface"

class RegisterGoogleUserUseCase {
    constructor(
        private userRepository: UserRepositoryInterface,
        private sessionRepository: SessionRepositoryInterface
    ) { }

    async execute({ googleToken, userData }: RegisterGoogleUserRequestParams) {
        // Validate if user exists
        const userAlreadyExists = await this.userRepository.getByEmail(userData.email)

        if (userAlreadyExists) {
            // Se usuário existe, verifica se já tem Google vinculado
            if (userAlreadyExists.googleId) {
                if (userAlreadyExists.googleId !== userData.googleId) {
                    throw new HttpConflictError("Conta Google já vinculada a outro usuário")
                }
                // Se for o mesmo googleId, atualiza dados se necessário
                // ... lógica de atualização se precisar
            } else {
                // Se não tem Google vinculado, vincula
                await this.userRepository.update({
                    userId: userAlreadyExists.id,
                    googleId: userData.googleId
                })
            }

            // Continua com o fluxo normal usando o usuário existente
            const accessTokenProvider = new AccessTokenProvider()
            const accessToken = await accessTokenProvider.execute(userAlreadyExists)

            const generateRefreshToken = new GenerateRefreshToken()
            const refreshToken = await generateRefreshToken.execute(userAlreadyExists.id)

            if (!refreshToken) {
                throw new HttpTokenError()
            }

            const expiresAt = dayjs.unix(refreshToken.expireIn).toDate();

            const session = await this.sessionRepository.create({
                expiresAt: expiresAt,
                userId: refreshToken.userId,
                refreshTokenId: refreshToken.id,
            })

            if (!session) {
                throw new Error("Erro ao criar sessão")
            }

            return { accessToken, session }
        }

        const passwordHash = await hash(userData.password, 8)
        // Se não existe, registra novo usuário
        const newUser = await this.userRepository.register({
            email: userData.email,
            username: userData.name,
            googleId: userData.googleId,
            avatarUrl: userData.picture,
            password: passwordHash
        })

        if (!newUser) {
            throw new Error("Erro ao criar o usuario.")
        }

        const accessTokenProvider = new AccessTokenProvider()
        const accessToken = await accessTokenProvider.execute(newUser)

        const generateRefreshToken = new GenerateRefreshToken()
        const refreshToken = await generateRefreshToken.execute(newUser.id)

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
            throw new Error("Erro ao criar sessão")
        }

        return { accessToken, session }
    }
}

export { RegisterGoogleUserUseCase }