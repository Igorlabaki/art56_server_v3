import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaVenueRuleRepository } from "../../../repositories/in-prisma/venue-rule-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { VenueRuleAuthorizer } from "../venue-rule-authorizer";
import { ListVenueRuleController } from "./controller-list-venue-rule";
import { ListVenueRuleUseCase } from "./use-case-list-venue-rule";

export const listVenueRuleFactory = () => {
    const repository = new PrismaVenueRuleRepository(prismaClient);
    const authorizer = new VenueRuleAuthorizer(
        new PrismaVenueRepository(prismaClient),
        new PrismaUserVenuePermissionRepository(prismaClient),
    );
    return new ListVenueRuleController(new ListVenueRuleUseCase(repository, authorizer));
};
