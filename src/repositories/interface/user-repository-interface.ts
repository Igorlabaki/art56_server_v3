import { User } from "@prisma/client";
import { RegisterUserRequestParams } from "../../zod/register-user-params-schema";
import { UpdateUserPasswordRequestParams } from "../../zod/update-user-password-params-schema";
export interface UserRepositoryInterface {
  delete: (params: string) => Promise<User | null>
  getById: (params: string) => Promise<User | null>
  getByEmail: (params: string) => Promise<User | null>
  register: (params: RegisterUserRequestParams) => Promise<User | null>
  updatePassword: (params: UpdateUserPasswordRequestParams ) => Promise<User | null>
}