import { Session, User } from "@prisma/client";

export interface CreateSessionRequestParams {
  userId: string;
  expiresAt: Date;
  refreshTokenId: string;
}

export interface UpdateSessionRequestParams {
  sessionId: string,
  data:{
    expiresAt?: Date;
    isValid?: boolean;
    refreshTokenId: string;
  }
}

export interface SessionRepositoryInterface {
  delete: (params: string) => Promise<Session | null>
  getById: (params: string) => Promise<Session | null>
  update: (params: UpdateSessionRequestParams) => Promise<Session | null>
  create: (params: CreateSessionRequestParams) => Promise<Session | null>
  getByUserId: (params: string) => Promise<Session & { user: Partial<User> } | null>
}