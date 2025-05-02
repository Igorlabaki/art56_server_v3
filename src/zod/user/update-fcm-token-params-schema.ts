import { z } from "zod";

export const updateFcmTokenSchema = z.object({
    userId: z.string().min(1, "O ID do usuário é obrigatório"),
    fcmToken: z.string()
        .min(1, "O token FCM é obrigatório")
        .refine(value => value.startsWith("fcm-") || value.startsWith("e"), {
            message: "Token FCM inválido"
        }),
});

export type UpdateFcmTokenRequestParams = z.infer<typeof updateFcmTokenSchema>; 