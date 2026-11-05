import { z } from "zod";

export const updatePublicProposalServicesBodySchema = z.object({
    serviceIds: z.array(z.string().uuid()).max(100),
    serviceHours: z.array(z.object({
        serviceId: z.string().uuid(),
        hours: z.number().int().min(0).max(8760),
    })).max(100).optional(),
});

export type UpdatePublicProposalServicesBody = z.infer<typeof updatePublicProposalServicesBodySchema>;
