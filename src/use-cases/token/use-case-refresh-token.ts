import { User } from "@prisma/client";
import { HttConfigurationError } from "../../errors/errors-type/http-configuration-error";
import { sign } from "jsonwebtoken";
import dayjs from "dayjs";
import { RefreshTokenRepositoryInterface } from "../../repositories/interface/refresh-token-repository-interface";

class RefreshTokenProviderUseCase {

    private jwtSecretKey: string;

    constructor(private refreshTokenRepository: RefreshTokenRepositoryInterface) {
        this.jwtSecretKey = process.env.JWT_SECRET_KEY!; // A chave secreta sendo carregada da variável de ambiente

        // Verificação se a chave secreta foi definida
        if (!this.jwtSecretKey) {
            throw new HttConfigurationError('Jwt secret key is not defined');
        }
    }

    async execute(user: User) {

        const token = sign({
            id: user.id,
            email: user.email,
            username: user.username,
        }, this.jwtSecretKey, {
            subject: user.id,
            expiresIn: dayjs().add(10, 'day').unix()
        })

        const userAlreadyhasRefreshToken =  await this.refreshTokenRepository.get(user.id)
        
        if(userAlreadyhasRefreshToken){
            await this.refreshTokenRepository.get(user.id)
        }
     
        const generateRefreshToke = await this.refreshTokenRepository.create(user.id)

        return {token, generateRefreshToke}
    }
}

export { RefreshTokenProviderUseCase }