import { PrismaMinimumPricePeriodRepository } from "../../../repositories/in-prisma/minimum-price-period-in-prisma-repository";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { VenuePriceAuthorizer } from "../venue-price-authorizer";
import { CreateMinimumPricePeriodController } from "./controller-create-minimum-price-period";
import { CreateMinimumPricePeriodUseCase } from "./use-case-create-minimum-price-period";

export const createMinimumPricePeriodFactory = () => {
    const repository = new PrismaMinimumPricePeriodRepository(prismaClient);
    const authorizer = new VenuePriceAuthorizer(
        new PrismaVenueRepository(prismaClient),
        new PrismaUserVenuePermissionRepository(prismaClient),
    );
    return new CreateMinimumPricePeriodController(new CreateMinimumPricePeriodUseCase(repository, authorizer));
};
