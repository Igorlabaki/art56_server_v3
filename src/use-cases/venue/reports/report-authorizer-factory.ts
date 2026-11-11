import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { ReportAuthorizer } from "./report-authorizer";

export const reportAuthorizerFactory = () =>
    new ReportAuthorizer(
        new PrismaVenueRepository(prismaClient),
        new PrismaUserVenuePermissionRepository(prismaClient),
    );
