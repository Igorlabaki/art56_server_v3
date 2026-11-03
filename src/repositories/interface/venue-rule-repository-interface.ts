import { VenueRule } from "@prisma/client";
import { CreateVenueRuleParams } from "../../zod/venue-rule/create-venue-rule-schema";
import { UpdateVenueRuleParams } from "../../zod/venue-rule/update-venue-rule-schema";

export interface VenueRuleRepositoryInterface {
    create: (params: CreateVenueRuleParams & { position: number }) => Promise<VenueRule>;
    listByVenue: (venueId: string) => Promise<VenueRule[]>;
    getById: (id: string) => Promise<VenueRule | null>;
    nextPosition: (venueId: string) => Promise<number>;
    update: (params: UpdateVenueRuleParams & { position: number }) => Promise<VenueRule>;
    delete: (id: string) => Promise<VenueRule>;
}
