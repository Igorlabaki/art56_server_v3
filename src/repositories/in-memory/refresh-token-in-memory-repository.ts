import dayjs from "dayjs";
import { RefreshToken } from "@prisma/client";
import { RefreshTokenRepositoryInterface } from "../interface/refresh-token-repository-interface";

// Simula um repositório de tokens de atualização em memória
export class MemoryRefreshTokenRepository implements RefreshTokenRepositoryInterface {

  private refreshTokens: RefreshToken[] = [];

  constructor() {}

  // Cria um novo token de atualização
  async create(reference: string): Promise<RefreshToken | null> {
    const expireIn = dayjs().add(1, 'day').unix();

    const newRefreshToken: RefreshToken = {
      id: `${this.refreshTokens.length + 1}`, // Gerando um ID simples
      userId: reference,
      expireIn: expireIn,
    };

    this.refreshTokens.push(newRefreshToken);
    return Promise.resolve(newRefreshToken); // Retorna a promessa resolvida com o novo token
  }

  // Busca um token de atualização pelo userId
  async get(reference: string): Promise<RefreshToken | null> {
    const token = this.refreshTokens.find(token => token.userId === reference);
    return Promise.resolve(token || null); // Retorna a promessa resolvida com o token ou null
  }

  // Deleta um token de atualização pelo ID
  async delete(reference: string): Promise<RefreshToken | null> {
    const tokenIndex = this.refreshTokens.findIndex(token => token.id === reference);

    if (tokenIndex === -1) return Promise.resolve(null); // Retorna null caso o token não exista

    const deletedToken = this.refreshTokens.splice(tokenIndex, 1)[0];
    return Promise.resolve(deletedToken); // Retorna a promessa resolvida com o token deletado
  }
}