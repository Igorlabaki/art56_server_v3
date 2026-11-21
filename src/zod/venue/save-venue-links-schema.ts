import { z } from "zod";
import { VENUE_LINK_KINDS } from "../../functions/venue-link";

const venueLinkKindSchema = z.enum(VENUE_LINK_KINDS);

export const saveVenueLinksBodySchema = z.object({
    links: z.array(z.object({
        kind: venueLinkKindSchema,
        url: z.string().nullable().optional(),
        visible: z.boolean(),
        position: z.number().int(),
    })),
});

export const orderVenueLinksBodySchema = z.object({
    kinds: z.array(venueLinkKindSchema),
});

export const hideVenueLinkBodySchema = z.object({
    kind: venueLinkKindSchema,
});

export const createVenueLinkBodySchema = z.object({
    kind: venueLinkKindSchema,
    url: z.string().optional(),
    visible: z.boolean().optional(),
});

export const setVenueLinkVisibleBodySchema = z.object({
    kind: venueLinkKindSchema,
    visible: z.boolean(),
});
