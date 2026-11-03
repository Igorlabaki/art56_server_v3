import { z } from "zod";

export const deleteVenueRuleParamSchema = z.object({
    ruleId: z.string().min(1),
});
