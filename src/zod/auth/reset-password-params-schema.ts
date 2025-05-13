import { z } from "zod";

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Token inválido"),
  newPassword: z.string().min(4, "A nova senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(4, "A confirmação de senha deve ter no mínimo 6 caracteres"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

export type ResetPasswordRequestParams = z.infer<typeof resetPasswordSchema>;