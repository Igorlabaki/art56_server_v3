import { PrismaOwnerRepository } from "../../repositories/in-prisma/owner-in-prisma-repository";
import { PrismaUserOrganizationRepository } from "../../repositories/in-prisma/user-organization-in-prisma-repository";
import { PrismaVenueRepository } from "../../repositories/in-prisma/venue-in-prisma-repository";
import prismaClient from "../../services/prisma-client";
import { OwnerAuthorizer } from "./owner-authorizer";

export const ownerAuthorizerFactory = (): OwnerAuthorizer =>
    new OwnerAuthorizer(
        new PrismaUserOrganizationRepository(prismaClient),
        new PrismaVenueRepository(prismaClient),
        new PrismaOwnerRepository(prismaClient),
    );
