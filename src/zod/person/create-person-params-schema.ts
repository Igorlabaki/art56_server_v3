import { z } from "zod";

export const createPersonSchema = z.object({
    name: z.string(),
    proposalId: z.string(),
    rg: z.string().optional(),
    email: z.string().optional(),
    userId: z.string().optional(),
    username: z.string().optional(),
    type: z.enum(["WORKER", "GUEST"]),
    venueInfo: z.object({
        city: z.string(),
        state: z.string(),
        street: z.string(),
        name: z.string(),
        email: z.string().email(),
        neighborhood: z.string(),
        streetNumber: z.string(),
    }).optional(), // Começa como opcional
})
    /* .refine(
        (data) => {
            if (data.email && data.type === "GUEST") {
                return data.venueInfo !== undefined;
            }
            return true;
        },
        {
            message: "Se o e-mail for informado, venueInfo é obrigatório.",
            path: ["venueInfo"],
        }
    ); */

export type CreatePersonRequestParams = z.infer<typeof createPersonSchema>;