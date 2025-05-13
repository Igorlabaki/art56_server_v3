import { z } from "zod";

export const forgotPasswordSchema = z.object({
    email: z.string().email("E-mail inválido")
});

export type ForgotPasswordRequestParams = z.infer<typeof forgotPasswordSchema>;
