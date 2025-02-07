import { z } from "zod";

export const deleteNotificationRequestParamSchema = z.object({
    notificationId: z.string(),
})

export type DeleteNotificationRequestParamSchema = z.infer<typeof deleteNotificationRequestParamSchema>;

