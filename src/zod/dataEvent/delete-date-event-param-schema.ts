import { z } from "zod";

export const deleteDateEventRequestParamSchema = z.object({
    dateEventId: z.string(),
})

export type DeleteDateEventRequestParamSchema = z.infer<typeof deleteDateEventRequestParamSchema>;

