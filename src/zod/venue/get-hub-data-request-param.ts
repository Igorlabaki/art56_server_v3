import { z } from "zod";

export const getHubDataRequestParamSchema = z.object({
    organizationId: z.string(),
})

export type GetHubDataRequestParamSchema = z.infer<typeof getHubDataRequestParamSchema>;

