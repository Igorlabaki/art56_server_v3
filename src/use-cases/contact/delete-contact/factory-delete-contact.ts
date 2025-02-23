import prismaClient from "../../../service/prisma-client";
import { DeleteContactUseCase } from "./use-case-delete-contact";
import { DeleteContactController } from "./controller-delete-contact";
import { PrismaContactRepository } from "../../../repositories/in-prisma/contact-in-prisma-repository";

export const deleteContactFactory = () => {
  const prismaContactRepository = new PrismaContactRepository(prismaClient);
  const deleteContactCase = new DeleteContactUseCase(prismaContactRepository);
  const deleteContactController = new DeleteContactController(deleteContactCase);

  return deleteContactController;
};
