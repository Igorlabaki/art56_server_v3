import dayjs from 'dayjs'
import { sign } from "jsonwebtoken"
import { User } from "@prisma/client"
import { HttConfigurationError } from '../errors/errors-type/http-configuration-error';

class RefreshTokenProvider {
    private jwtSecretKey: string;

    constructor() {
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

        return token
    }
}

export { RefreshTokenProvider }

