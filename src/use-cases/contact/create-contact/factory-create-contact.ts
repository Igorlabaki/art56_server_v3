import prismaClient from "../../../services/prisma-client";
import { CreateContactUseCase } from "./use-case-create-contact";
import { CreateContactController } from "./controller-create-contact";
import { PrismaContactRepository } from "../../../repositories/in-prisma/contact-in-prisma-repository";

export const createContactFactory = () => {
  const prismaContactRepository = new PrismaContactRepository(prismaClient);
  const createContactsCase = new CreateContactUseCase(prismaContactRepository); 
  const createContactController = new CreateContactController(createContactsCase);

  return createContactController;
};
