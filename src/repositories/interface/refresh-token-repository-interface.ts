import { RefreshToken } from "@prisma/client";

export interface RefreshTokenRepositoryInterface {
  get:(params: string) => Promise<RefreshToken | null>
  create:(params: string) => Promise<RefreshToken | null>
  delete:(params: string) => Promise<RefreshToken | null>
}