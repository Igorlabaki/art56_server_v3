import { z } from "zod";

export const updatePasswordSchema = z.object({
    userId: z.string(),
    currentPassword: z.string().min(4, "A senha atual deve ter no mínimo 6 caracteres"),
    newPassword: z.string().min(4, "A nova senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(4, "A confirmação de senha deve ter no mínimo 6 caracteres")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"]
});

export type UpdatePasswordRequestParams = z.infer<typeof updatePasswordSchema>; 