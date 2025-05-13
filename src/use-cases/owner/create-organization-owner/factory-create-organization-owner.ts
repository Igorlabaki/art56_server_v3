import prismaClient from "../../../services/prisma-client";
import { CreateOrganizationOwnerUseCase } from "./use-case-create-organition-owner";
import { CreateOrganizationOwnerController } from "./controller-create-organization-owner";
import { PrismaOwnerRepository } from "../../../repositories/in-prisma/owner-in-prisma-repository";


export const createOrganizationOwnerFactory = (): CreateOrganizationOwnerController => {
    const prismaOwnerRepository = new PrismaOwnerRepository(prismaClient);
    const createOrganizationOwnerUseCase = new CreateOrganizationOwnerUseCase(prismaOwnerRepository);
    const createOrganizationOwnerController = new CreateOrganizationOwnerController(createOrganizationOwnerUseCase);

    return createOrganizationOwnerController;
};
