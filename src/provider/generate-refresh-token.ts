import { PrismaRefreshTokenRepository } from "../repositories/in-prisma/refresh-token-in-prisma-repository"
import prismaClient from "../service/prisma-client"

class GenerateRefreshToken{

    async execute(userId: string){

        const tokenRepo = new PrismaRefreshTokenRepository(prismaClient)

        const userAlreadyhasRefreshToken =  await tokenRepo.get(userId)
        
        if(userAlreadyhasRefreshToken){
            await tokenRepo.delete(userId)
        }
     
        const generateRefreshToke = await tokenRepo.create(userId)

        return generateRefreshToke
    }
}

export {GenerateRefreshToken}