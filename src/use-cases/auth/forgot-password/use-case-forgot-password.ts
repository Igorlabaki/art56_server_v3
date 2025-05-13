import { randomBytes } from "crypto";
import { addHours } from "date-fns";

import { ForgotPasswordRequestParams } from "../../../zod/auth/forgot-password-params-schema";
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { sendForgotPasswordEmail } from "../../../services/send-forgot-password-email";

export class ForgotPasswordUseCase {
  constructor(private userRepository: UserRepositoryInterface) {}

  async execute(params: ForgotPasswordRequestParams) {
    const user = await this.userRepository.getByEmail(params.email);

    // Sempre retorna sucesso para não expor se o e-mail existe ou não
    if (!user) {
      return { message: "Se o e-mail existir, enviaremos instruções para redefinir a senha." };
    }

    // Gera token seguro
    const token = randomBytes(32).toString("hex");
    const expires = addHours(new Date(), 1);

    // Salva token e expiração no banco
    await this.userRepository.forgotPassword({
      email: user.email,
      passwordResetToken: token,
      passwordResetExpires: expires,
    });

    // Envia e-mail
    await sendForgotPasswordEmail(user.email, token);

    return { message: "Se o e-mail existir, enviaremos instruções para redefinir a senha." };
  }
}