import { decode, sign, verify } from "jsonwebtoken";
import dayjs from "dayjs";
import { RefreshTokenRepositoryInterface } from "../../repositories/interface/refresh-token-repository-interface";
import { SessionRepositoryInterface } from "../../repositories/interface/session-repository-interface";
import { AccessTokenProvider } from "../../provider/access-token-provider";
import { HttConfigurationError } from "../../errors/errors-type/http-configuration-error";
import { HttpTokenError } from "../../errors/errors-type/http-token-error";
import { GenerateRefreshToken } from "../../provider/generate-refresh-token";
import { HttpResourceNotFoundError } from "../../errors/errors-type/http-resource-not-found-error";

class RefreshTokenUseCase {

    private jwtSecretKey: string;

    constructor(
        private refreshTokenRepository: RefreshTokenRepositoryInterface,
        private sessionRepository: SessionRepositoryInterface
    ) {
        this.jwtSecretKey = process.env.JWT_SECRET_KEY!; // A chave secreta sendo carregada da variável de ambiente

        if (!this.jwtSecretKey) {
            throw new HttConfigurationError('Jwt secret key is not defined');
        }
    }

    async execute(accessToken: string) {
        
        const decoded = decode(accessToken);

        if (typeof decoded !== 'object' || !decoded?.id || !decoded?.email) {
            throw new HttpTokenError();
        }

        // 2. Buscar a sessão relacionada ao refresh token no banco de dados
        const session = await this.sessionRepository.getByUserId(decoded.id);

        if (!session) {
            throw new HttpResourceNotFoundError("Sessao");
        }

        if (!session.isValid) {
            throw new HttpTokenError();
        }

        // 3. Verificar se o refresh token ainda é válido
        const refreshTokenFromDb = await this.refreshTokenRepository.get(decoded.id);
        if (!refreshTokenFromDb || refreshTokenFromDb.expireIn < dayjs().unix()) {
            throw new HttpTokenError();
        }

        
        // Verificar se a sessão existe e se está válida
        if (dayjs(session.expiresAt).isBefore(dayjs())) {
            await this.sessionRepository.update({sessionId:session.id,data:{refreshTokenId:refreshTokenFromDb.id, isValid: false}});
            throw new HttpTokenError();
        }


        // 4. Gerar novo access token
        const accessTokenProvider = new AccessTokenProvider();
        const newAccessToken = await accessTokenProvider.execute({
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
        });

        const generateRefreshToke = new GenerateRefreshToken()
        const refreshToken = await generateRefreshToke.execute(decoded.id)

        if (!refreshToken) {
            throw new HttpTokenError();
        }

        // 5. Atualizar a validade da sessão, caso necessário
        const newExpiresAt = dayjs.unix(refreshToken.expireIn).toDate();
 
        const sessionUpdated = await this.sessionRepository.update({
            sessionId: session.id,
            data:{
                expiresAt: newExpiresAt,
                refreshTokenId: refreshToken?.id,
            }
        });

        if (!sessionUpdated) {
            throw new HttpResourceNotFoundError("Sessao");
        }

        // 6. Retornar o novo access token
        return { accessToken: newAccessToken, session: sessionUpdated };
    }
}

export { RefreshTokenUseCase }
