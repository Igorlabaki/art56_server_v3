import { z } from "zod";

export const authenticateUserSchema = z.object({
    email: z.string()
      .email("O campo 'email' deve ser um e-mail válido")  
      .min(6, "O campo 'email' é obrigatório").refine(value => typeof value === 'string' && isNaN(Number(value)), {
        message: "O campo 'email' não pode ser um número",  // Mensagem personalizada
      }),             
    password: z.string()
    .min(1, "Este campo é obrigatório"),           
    fcmToken: z.string().optional(),           
  });

export type AuthenticateUserRequestParams = z.infer<typeof authenticateUserSchema>;