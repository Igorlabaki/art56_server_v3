import { z } from "zod";

export const forgotPasswordDbSchema = z.object({
    email: z.string().email("E-mail inválido"),
    passwordResetToken: z.string().min(1, "Token de recuperação de senha é obrigatório"),
    passwordResetExpires: z.date().min(new Date(), "Data de expiração do token de recuperação de senha é obrigatória")
});

export type ForgotPasswordDbParams = z.infer<typeof forgotPasswordDbSchema>;
