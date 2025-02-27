import { z } from "zod";

export const deleteContractRequestParamSchema = z.object({
    contractId: z.string(),
})

export type DeleteContractRequestParamSchema = z.infer<typeof deleteContractRequestParamSchema>;

