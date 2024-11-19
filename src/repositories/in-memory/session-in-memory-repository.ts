import dayjs from "dayjs";
import { Session, User } from "@prisma/client";

import { CreateSessionRequestParams, SessionRepositoryInterface, UpdateSessionRequestParams } from "../interface/session-repository-interface";

export class InMemorySessionRepository implements SessionRepositoryInterface {
  private sessions: Session[] = [];

  // Criando uma nova sessão
  async create(params: CreateSessionRequestParams): Promise<Session | null> {
    const newSession: Session = {
      id: `${this.sessions.length + 1}`, // Simulação de ID único
      ipAddress: "",
      isValid: true,
      userId: params.userId,
      createdAt: new Date(),
      refreshTokenId: params.refreshTokenId,
      expiresAt: dayjs().add(10, 'day').toDate(),
    };

    this.sessions.push(newSession);
    return newSession;
  }

  // Encontrando uma sessão pelo ID
  async getById(reference: string): Promise<Session | null> {
    const session = this.sessions.find(session => session.id === reference);
    return session || null;
  }

  async getByUserId(reference: string): Promise<Session & { user: Partial<User> }  | null> {
    const session = this.sessions.find(session => session.userId === reference);
    return session || null;
  }

  // Deletando uma sessão pelo ID
  async delete(reference: string): Promise<Session | null> {
    const sessionIndex = this.sessions.findIndex(session => session.id === reference);

    if (sessionIndex === -1) {
      return null; // Não encontrou a sessão
    }

    const [deletedSession] = this.sessions.splice(sessionIndex, 1); // Remove a sessão do array
    return deletedSession || null;
  }
}
