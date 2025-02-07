import { z } from "zod";

export const getByidNotificationRequestParamSchema = z.object({
    notificationId: z.string(),
})

export type GetByidNotificationRequestParamSchema = z.infer<typeof getByidNotificationRequestParamSchema>;

