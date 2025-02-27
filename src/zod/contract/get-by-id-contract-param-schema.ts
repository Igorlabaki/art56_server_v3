import { z } from "zod";

export const getContractByIdRequestParamSchema = z.object({
    contractId: z.string(),
})

export type GetContractByIdRequestParamSchema = z.infer<typeof getContractByIdRequestParamSchema>;

