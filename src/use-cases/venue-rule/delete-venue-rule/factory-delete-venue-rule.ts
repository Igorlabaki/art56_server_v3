import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaVenueRuleRepository } from "../../../repositories/in-prisma/venue-rule-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { VenueRuleAuthorizer } from "../venue-rule-authorizer";
import { DeleteVenueRuleController } from "./controller-delete-venue-rule";
import { DeleteVenueRuleUseCase } from "./use-case-delete-venue-rule";

export const deleteVenueRuleFactory = () => {
    const repository = new PrismaVenueRuleRepository(prismaClient);
    const authorizer = new VenueRuleAuthorizer(
        new PrismaVenueRepository(prismaClient),
        new PrismaUserVenuePermissionRepository(prismaClient),
    );
    return new DeleteVenueRuleController(new DeleteVenueRuleUseCase(repository, authorizer));
};
