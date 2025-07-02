import { z } from "zod";

export const getOrganziationWebDataRequestParamSchema = z.object({
    organizationId: z.string(),
})

export type GetOrganziationWebDataRequestParamSchema = z.infer<typeof getOrganziationWebDataRequestParamSchema>;

