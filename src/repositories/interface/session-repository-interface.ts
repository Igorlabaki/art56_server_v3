import { Session } from "@prisma/client";

export interface CreateSessionRequestParams {
  userId: string;
  refreshTokenId: string;
}

export interface SessionRepositoryInterface {
  delete: (params: string) => Promise<Session | null>
  getById: (params: string) => Promise<Session | null>
  create: (params: CreateSessionRequestParams) => Promise<Session | null>
}