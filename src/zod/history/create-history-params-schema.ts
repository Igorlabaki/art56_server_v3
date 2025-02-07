import { z } from "zod";

export const createHistoryRequestParams = z.object({
    action: z.string(),
    proposalId: z.string(),
    userId: z.string().optional(),  // Opcional inicialmente
    username: z.string().optional(), // Opcional inicialmente
}).refine(
  (data) => !data.userId || (data.userId && data.username),
  {
    message: "Nome do usuario e obrigatorio.",
    path: ["username"], // Aponta o erro para o campo `username`
  }
);

export type CreateHistoryRequestParams = z.infer<typeof createHistoryRequestParams>;