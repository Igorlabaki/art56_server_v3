import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaVenueRuleRepository } from "../../../repositories/in-prisma/venue-rule-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { ListPublicVenueRuleController } from "./controller-list-public-venue-rule";
import { ListPublicVenueRuleUseCase } from "./use-case-list-public-venue-rule";

export const listPublicVenueRuleFactory = () => {
    const rules = new PrismaVenueRuleRepository(prismaClient);
    const venues = new PrismaVenueRepository(prismaClient);
    return new ListPublicVenueRuleController(new ListPublicVenueRuleUseCase(rules, venues));
};
