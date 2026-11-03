import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaVenueRuleRepository } from "../../../repositories/in-prisma/venue-rule-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { VenueRuleAuthorizer } from "../venue-rule-authorizer";
import { CreateVenueRuleController } from "./controller-create-venue-rule";
import { CreateVenueRuleUseCase } from "./use-case-create-venue-rule";

export const createVenueRuleFactory = () => {
    const repository = new PrismaVenueRuleRepository(prismaClient);
    const authorizer = new VenueRuleAuthorizer(
        new PrismaVenueRepository(prismaClient),
        new PrismaUserVenuePermissionRepository(prismaClient),
    );
    return new CreateVenueRuleController(new CreateVenueRuleUseCase(repository, authorizer));
};
