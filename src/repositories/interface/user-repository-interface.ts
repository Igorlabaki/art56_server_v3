import { User } from "@prisma/client";
import { UpdateUserRequestParams } from "../../zod/user/update-user-params-schema";
import { ListUserRequestQuerySchema } from "../../zod/user/list-user-query-schema";
import { RegisterUserRequestParams } from "../../zod/auth/register-user-params-schema";
import { UpdatePasswordDbSchema } from "../../zod/auth/update-password-db-schema";
import { ForgotPasswordDbParams } from "../../zod/auth/forgot-password-db-schema";
import { ResetPasswordRequestParams } from "../../zod/auth/reset-password-params-schema";
import { GetByPasswordResetToken } from "../../zod/auth/get-password-reset-token-params-schema copy";

export type UserWithoutPassword = Omit<User, "password">;

export type UserWithPartial = Partial<UserWithoutPassword>;
export interface UserRepositoryInterface {
  delete: (params: string) => Promise<User | null>
  getById: (params: string) => Promise<User | null>
  getByEmail: (params: string) => Promise<User | null>
  getByGoogleId: (params: string) => Promise<User | null>
  list: (params: ListUserRequestQuerySchema) => Promise<User[] | null>
  register: (params: RegisterUserRequestParams) => Promise<User | null>
  forgotPassword: (params: ForgotPasswordDbParams) => Promise<User | null>
  updatePassword: (params: UpdatePasswordDbSchema ) => Promise<User | null>
  updateFcmToken: (userId: string, fcmToken: string) => Promise<User | null>
  resetPassword: (params: ResetPasswordRequestParams) => Promise<User | null>
  update: (params: UpdateUserRequestParams) => Promise<UserWithPartial | null>
  getByPasswordResetToken: (params: GetByPasswordResetToken ) => Promise<UserWithPartial | null>
}