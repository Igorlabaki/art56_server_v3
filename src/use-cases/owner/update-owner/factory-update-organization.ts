import prismaClient from "../../../service/prisma-client";
import { UpdateOwnerUseCase } from "./use-case-update-owner";
import { UpdateOwnerController } from "./controller-update-owner";
import { PrismaOwnerRepository } from "../../../repositories/in-prisma/owner-in-prisma-repository";

export const updateOwnerFactory = () => {
  const prismaOwnerRepository = new PrismaOwnerRepository(prismaClient);
  const updateOwnerCase = new UpdateOwnerUseCase(prismaOwnerRepository);
  const updateOwnerController = new UpdateOwnerController(updateOwnerCase);

  return updateOwnerController;
};
