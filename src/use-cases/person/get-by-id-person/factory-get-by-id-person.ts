import prismaClient from "../../../service/prisma-client";
import { GetByIdPersonUseCase } from "./use-case-get-by-id-person";
import { GetByIdPersonController } from "./controller-get-by-id-person";
import { PrismaPersonRepository } from "../../../repositories/in-prisma/person-in-prisma-repository";

export const getByIdPersonFactory = () => {
  const prismaPersonRepository = new PrismaPersonRepository(prismaClient);
  const getbyidPersonCase = new GetByIdPersonUseCase(prismaPersonRepository);
  const getbyidPersonController = new GetByIdPersonController(getbyidPersonCase);

  return getbyidPersonController;
};
