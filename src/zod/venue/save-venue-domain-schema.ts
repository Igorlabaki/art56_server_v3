import { z } from "zod";

export const saveVenueDomainBodySchema = z.object({
    hostname: z.string(),
});
