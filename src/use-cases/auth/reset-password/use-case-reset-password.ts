import { hash } from "bcryptjs";
import { ResetPasswordRequestParams } from "../../../zod/auth/reset-password-params-schema";
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpInvalidCredentialsError } from "../../../errors/errors-type/http-invalid-credentials-error";

export class ResetPasswordUseCase {
  constructor(private userRepository: UserRepositoryInterface) {}

  async execute({ token, newPassword }: ResetPasswordRequestParams) {
    // Busca o usuário pelo token
    const user = await this.userRepository.getByPasswordResetToken({token});

    if (!user?.id) {
      throw new HttpResourceNotFoundError("Token inválido ou usuário não encontrado");
    }

    if (!user.passwordResetToken || user.passwordResetToken !== token) {
      throw new HttpInvalidCredentialsError("Token inválido");
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new HttpInvalidCredentialsError("Token expirado");
    }

    // Gera o hash da nova senha
    const hashedPassword = await hash(newPassword, 8);

    // Atualiza a senha e limpa o token
    await this.userRepository.updatePassword({
      userId: user.id,
      password: hashedPassword,
    });

    await this.userRepository.update({
      userId: user.id,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return {
      success: true,
      message: "Senha redefinida com sucesso!",
    };
  }
}