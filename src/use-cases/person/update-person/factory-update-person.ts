import prismaClient from "../../../service/prisma-client";
import { UpdatePersonUseCase } from "./use-case-update-person";
import { UpdatePersonController } from "./controller-update-person";
import { PrismaPersonRepository } from "../../../repositories/in-prisma/person-in-prisma-repository";

export const updatePersonFactory = () => {
  const prismaPersonRepository = new PrismaPersonRepository(prismaClient);
  const updatePersonCase = new UpdatePersonUseCase(prismaPersonRepository);
  const updatePersonController = new UpdatePersonController(updatePersonCase);

  return updatePersonController;
};
