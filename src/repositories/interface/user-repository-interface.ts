import { User } from "@prisma/client";
import { UpdateUserRequestParams } from "../../zod/user/update-user-params-schema";
import { ListUserRequestQuerySchema } from "../../zod/user/list-user-query-schema";
import { RegisterUserRequestParams } from "../../zod/auth/register-user-params-schema";
import { UpdateUserPasswordRequestParams } from "../../zod/auth/update-user-password-params-schema";

export type UserWithoutPassword = Omit<User, "password">;

export type UserWithPartial = Partial<UserWithoutPassword>;
export interface UserRepositoryInterface {
  delete: (params: string) => Promise<User | null>
  getById: (params: string) => Promise<User | null>
  getByEmail: (params: string) => Promise<User | null>
  getByGoogleId: (params: string) => Promise<User | null>
  list: (params: ListUserRequestQuerySchema) => Promise<User[] | null>
  update: (params: UpdateUserRequestParams) => Promise<UserWithPartial | null>
  register: (params: RegisterUserRequestParams) => Promise<User | null>
  updatePassword: (params: UpdateUserPasswordRequestParams ) => Promise<User | null>
}