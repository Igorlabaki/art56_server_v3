import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaVenueRuleRepository } from "../../../repositories/in-prisma/venue-rule-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { VenueRuleAuthorizer } from "../venue-rule-authorizer";
import { UpdateVenueRuleController } from "./controller-update-venue-rule";
import { UpdateVenueRuleUseCase } from "./use-case-update-venue-rule";

export const updateVenueRuleFactory = () => {
    const repository = new PrismaVenueRuleRepository(prismaClient);
    const authorizer = new VenueRuleAuthorizer(
        new PrismaVenueRepository(prismaClient),
        new PrismaUserVenuePermissionRepository(prismaClient),
    );
    return new UpdateVenueRuleController(new UpdateVenueRuleUseCase(repository, authorizer));
};
