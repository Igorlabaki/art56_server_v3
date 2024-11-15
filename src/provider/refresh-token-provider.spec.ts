import { beforeEach } from "node:test";
import { describe, expect, it, vi } from "vitest";
import { RefreshTokenProvider } from "./refresh-token-provider";
import { HttConfigurationError } from "../errors/errors-type/http-configuration-error";
import { User } from "@prisma/client";
import { sign } from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => ({
    sign: vi.fn().mockReturnValue('mocked_token'),
}));

describe('Generate refresh token', () => {
    let refreshTokenProvider: RefreshTokenProvider;

    beforeEach(() => {
        refreshTokenProvider = new RefreshTokenProvider();
    });

    it.skip('should generate a mocked token', async () => {
        const user = { id: 'user123', email: 'test@example.com', username: 'testuser', password: "ehuaiheuia" };
        
        const token = await refreshTokenProvider?.execute(user);
        
        // Verifica se o token gerado é o valor mockado
        expect(token).toBe('mocked_token');
        
        // Verifica se a função 'sign' foi chamada com os parâmetros corretos
        expect(sign).toHaveBeenCalledWith(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET_KEY, // A chave secreta no ambiente
            expect.objectContaining({ expiresIn: expect.any(String), subject: user.id })
        );
    });

    it('should throw an error if JWT_SECRET_KEY is not defined', () => {
        // Salvar o valor original de process.env.JWT_SECRET_KEY para restaurar após o teste
        const originalJwtSecretKey = process.env.JWT_SECRET_KEY;

        // Definir a variável de ambiente como indefinida
        delete process.env.JWT_SECRET_KEY;

        // Verificar se a exceção é lançada corretamente
        expect(() => new RefreshTokenProvider()).toThrowError(HttConfigurationError);

        // Restaurar o valor original de process.env.JWT_SECRET_KEY
        process.env.JWT_SECRET_KEY = originalJwtSecretKey;
    });
});