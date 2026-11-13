import prismaClient from "../../../services/prisma-client";
import { CreateOrganizationOwnerUseCase } from "./use-case-create-organition-owner";
import { CreateOrganizationOwnerController } from "./controller-create-organization-owner";
import { PrismaOwnerRepository } from "../../../repositories/in-prisma/owner-in-prisma-repository";
import { ownerAuthorizerFactory } from "../factory-owner-authorizer";


export const createOrganizationOwnerFactory = (): CreateOrganizationOwnerController => {
    const prismaOwnerRepository = new PrismaOwnerRepository(prismaClient);
    const createOrganizationOwnerUseCase = new CreateOrganizationOwnerUseCase(prismaOwnerRepository, ownerAuthorizerFactory());
    const createOrganizationOwnerController = new CreateOrganizationOwnerController(createOrganizationOwnerUseCase);

    return createOrganizationOwnerController;
};
