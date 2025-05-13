import prismaClient from "../../../services/prisma-client";
import { DeleteOwnerUseCase } from "./use-case-delete-owner";
import { DeleteOwnerController } from "./controller-delete-owner";
import { PrismaOwnerRepository } from "../../../repositories/in-prisma/owner-in-prisma-repository";

export const deleteOwnerFactory = () => {
  const prismaOwnerRepository = new PrismaOwnerRepository(prismaClient);
  const deleteOwnerCase = new DeleteOwnerUseCase(prismaOwnerRepository);
  const deleteOwnerController = new DeleteOwnerController(deleteOwnerCase);

  return deleteOwnerController;
};
