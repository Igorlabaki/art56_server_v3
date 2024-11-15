import { User } from "@prisma/client";
import { RegisterUserRequestParams } from "../../zod/registerUserParamsSchema";

export interface UserRepositoryInterface {
  delete: (params: string) => Promise<User | null>
  getById: (params: string) => Promise<User | null>
  getByEmail: (params: string) => Promise<User | null>
  register: (params: RegisterUserRequestParams) => Promise<User | null>
}