import { ProposalType } from "@prisma/client";
import { z } from "zod";
import { serviceCourtesySchema } from "./service-courtesy-schema";

const hourOfDay = z.string().regex(/^\d{2}:\d{2}$/);

export const quoteProposalBodySchema = z.object({
    venueId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startHour: hourOfDay,
    endHour: hourOfDay,
    guestNumber: z.number().int().min(1),
    serviceIds: z.array(z.string()).max(100).default([]),
    serviceHours: z.array(z.object({
        serviceId: z.string(),
        hours: z.number().int().min(0).max(8760),
    })).max(100).default([]),
    serviceCourtesy: serviceCourtesySchema,
    type: z.nativeEnum(ProposalType),
});

export type QuoteProposalBody = z.infer<typeof quoteProposalBodySchema>;
