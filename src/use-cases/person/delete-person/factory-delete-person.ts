import prismaClient from "../../../service/prisma-client";
import { DeletePersonUseCase } from "./use-case-delete-person";
import { DeletePersonController } from "./controller-delete-person";
import { PrismaPersonRepository } from "../../../repositories/in-prisma/person-in-prisma-repository";

export const deletePersonFactory = () => {
  const prismaPersonRepository = new PrismaPersonRepository(prismaClient);
  const deletePersonCase = new DeletePersonUseCase(prismaPersonRepository);
  const deletePersonController = new DeletePersonController(deletePersonCase);

  return deletePersonController;
};
