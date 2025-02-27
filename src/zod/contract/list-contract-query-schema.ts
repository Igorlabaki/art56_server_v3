import { z } from "zod";

export const listContractRequestQuerySchema = z.object({
    organizationId: z.string(),
    title: z.string().optional(),
})

export type ListContractRequestQuerySchema = z.infer<typeof listContractRequestQuerySchema>;

