import { z } from "zod";

export const deleteServiceRequestParamSchema = z.object({
    serviceId: z.string(),
})

export type DeleteServiceRequestParamSchema = z.infer<typeof deleteServiceRequestParamSchema>;

