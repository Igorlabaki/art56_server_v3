import { z } from "zod";
import { MAX_COURTESY_ENTRIES, MAX_COURTESY_QUANTITY } from "../../functions/quote-service-lines";

export const serviceCourtesySchema = z.array(z.object({
    serviceId: z.string(),
    quantity: z.number().int().min(0).max(MAX_COURTESY_QUANTITY),
})).max(MAX_COURTESY_ENTRIES).optional();
