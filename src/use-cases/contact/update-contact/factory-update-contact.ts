import prismaClient from "../../../services/prisma-client";
import { UpdateContactUseCase } from "./use-case-update-contact";
import { UpdateContactController } from "./controller-update-contact";
import { PrismaContactRepository } from "../../../repositories/in-prisma/contact-in-prisma-repository";

export const updateContactFactory = () => {
  const prismaContactRepository = new PrismaContactRepository(prismaClient);
  const updateContactCase = new UpdateContactUseCase(prismaContactRepository);
  const updateContactController = new UpdateContactController(updateContactCase);

  return updateContactController;
};
