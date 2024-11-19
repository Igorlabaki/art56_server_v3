import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken"
import { HttpTokenError } from "../errors/errors-type/http-token-error";
import { handleErrors } from "../errors/error-handler";

export function ensureAuthenticate(req: Request, resp: Response, next: NextFunction): void {
    const authToken = req.headers.authorization;

    if (!authToken) {
        const errorResponse = handleErrors(new HttpTokenError());
        resp.status(errorResponse.statusCode).json(errorResponse.body);
        return
    }

    const [, token] = authToken.split(" ");

    try {
        verify(token, process.env.JWT_SECRET_KEY!);
        next();
    } catch (error) {
        // Captura e formata o erro
        const errorResponse = handleErrors(error);
        resp.status(errorResponse.statusCode).json(errorResponse.body);
        return
    }
}

/* import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { PrismaSessionRepository } from "../repositories/in-prisma/session-in-prisma-repository";
import prismaClient from "../service/prisma-client";
import { HttpTokenError } from "../errors/errors-type/http-token-error copy";
import { RefreshTokenProvider } from "../provider/refresh-token-provider";
import { GenerateRefreshToken } from "../provider/generate-refresh-token";
import { HttpResourceNotFoundError } from "../errors/errors-type/http-resource-not-found-error";

export async function ensureAuthenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authToken = req.headers.authorization;

    if (!authToken) {
        return res.status(401).json({
            message: "Token is missing",
        });
    }

    const [, token] = authToken.split(" ");

    try {
        // Validação do token JWT
        const decoded = verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload;
        if (!decoded || !decoded.id) {
            throw new HttpTokenError("Invalid token payload");
        }

        const sessionRepo = new PrismaSessionRepository(prismaClient);
        const session = await sessionRepo.getByUserId(decoded.id);

        if (!session || !session.user.email || !session.user.username) {
            throw new HttpResourceNotFoundError("Session not found");
        }

        // Atualização do token e refresh token
        const refreshTokenProvider = new RefreshTokenProvider();
        const newToken = await refreshTokenProvider.execute({
            email: session.user.email,
            id: session.userId,
            username: session.user.username,
        });

        const generateRefreshToken = new GenerateRefreshToken();
        const refreshToken = await generateRefreshToken.execute(session.userId);

        if (!refreshToken) {
            throw new HttpTokenError("Unable to generate refresh token");
        }

        // Atualizar a data de expiração da sessão
        await sessionRepo.updateExpireDate({
            sessionId: session.id,
            refreshTokenId: refreshToken.id,
        });

        // Adicionar o novo token no cabeçalho de resposta
        res.setHeader("Authorization", `Bearer ${newToken}`);
        req.userId = decoded.id; // Adiciona o ID do usuário ao objeto da requisição para uso posterior.

        next();
    } catch (error) {
        if (error instanceof HttpTokenError) {
            return res.status(401).json({ message: error.message });
        }
        if (error instanceof HttpResourceNotFoundError) {
            return res.status(404).json({ message: error.message });
        }

        // Para qualquer outro erro
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
} */