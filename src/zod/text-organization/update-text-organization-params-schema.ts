import { z } from "zod";

export const updateTextOrganizationSchema = z.object({
    textId: z.string(),
    organizaitonId: z.string(),
    data: z.object({
        area: z.string().optional(),
        title: z.string().optional(),
        position: z.number().optional(),
        text: z.string().optional(),
    }),
});

export type UpdateTextOrganizationSchema = z.infer<typeof updateTextOrganizationSchema>;