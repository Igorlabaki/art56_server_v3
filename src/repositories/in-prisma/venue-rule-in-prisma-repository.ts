import { PrismaClient, VenueRule } from "@prisma/client";
import { VenueRuleRepositoryInterface } from "../interface/venue-rule-repository-interface";
import { CreateVenueRuleParams } from "../../zod/venue-rule/create-venue-rule-schema";
import { UpdateVenueRuleParams } from "../../zod/venue-rule/update-venue-rule-schema";

export class PrismaVenueRuleRepository implements VenueRuleRepositoryInterface {
    constructor(private readonly prisma: PrismaClient) {}

    async create(params: CreateVenueRuleParams & { position: number }): Promise<VenueRule> {
        return this.prisma.venueRule.create({
            data: {
                venueId: params.venueId,
                title: params.title,
                text: params.text,
                position: params.position,
            },
        });
    }

    async listByVenue(venueId: string): Promise<VenueRule[]> {
        return this.prisma.venueRule.findMany({
            where: { venueId },
            orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        });
    }

    async getById(id: string): Promise<VenueRule | null> {
        return this.prisma.venueRule.findFirst({ where: { id } });
    }

    async nextPosition(venueId: string): Promise<number> {
        const result = await this.prisma.venueRule.aggregate({
            where: { venueId },
            _max: { position: true },
        });
        if (result._max.position == null) return 0;
        return result._max.position + 1;
    }

    async update(params: UpdateVenueRuleParams & { position: number }): Promise<VenueRule> {
        return this.prisma.venueRule.update({
            where: { id: params.ruleId },
            data: {
                title: params.title,
                text: params.text,
                position: params.position,
            },
        });
    }

    async delete(id: string): Promise<VenueRule> {
        return this.prisma.venueRule.delete({ where: { id } });
    }
}
