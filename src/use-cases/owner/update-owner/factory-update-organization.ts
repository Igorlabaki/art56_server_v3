import prismaClient from "../../../services/prisma-client";
import { UpdateOwnerUseCase } from "./use-case-update-owner";
import { UpdateOwnerController } from "./controller-update-owner";
import { PrismaOwnerRepository } from "../../../repositories/in-prisma/owner-in-prisma-repository";
import { ownerAuthorizerFactory } from "../factory-owner-authorizer";

export const updateOwnerFactory = () => {
  const prismaOwnerRepository = new PrismaOwnerRepository(prismaClient);
  const updateOwnerCase = new UpdateOwnerUseCase(prismaOwnerRepository, ownerAuthorizerFactory());
  const updateOwnerController = new UpdateOwnerController(updateOwnerCase);

  return updateOwnerController;
};
