import { z } from "zod";

export const publicSurfaceViewBodySchema = z.object({
    surface: z.enum(["LINKS", "FORM"]),
    visitorKey: z.string().max(80).optional(),
}).strict();
