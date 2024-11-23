import dayjs from 'dayjs'
import { sign } from "jsonwebtoken"
import { User } from "@prisma/client"
import { HttConfigurationError } from '../errors/errors-type/http-configuration-error';

class AccessTokenProvider {
    private jwtSecretKey: string;

    constructor() {
        this.jwtSecretKey = process.env.JWT_SECRET_KEY!; // A chave secreta sendo carregada da variável de ambiente

        // Verificação se a chave secreta foi definida
        if (!this.jwtSecretKey) {
            throw new HttConfigurationError('Jwt secret key is not defined');
        }
    }

    async execute({id,email,username}: {id:string,email:string,username:string}) {
        const accessToken = sign({
            id: id,
            email: email,
            username: username,
        }, this.jwtSecretKey, {
            subject: id,
           expiresIn: '10d'
        })

        return accessToken
    }
}

export { AccessTokenProvider }

