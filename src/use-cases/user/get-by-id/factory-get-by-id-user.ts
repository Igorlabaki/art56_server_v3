import prismaClient from "../../../service/prisma-client";
import { GetByIdUserUseCase } from "./use-case-get-by-id-user";
import { GetByIdUserController } from "./controller-get-by-id-user";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";

export const getByIdUserFactory = () => {
  const prismaUserRepository = new PrismaUserRepository(prismaClient);
  const getbyidUserCase = new GetByIdUserUseCase(prismaUserRepository);
  const getbyidUserController = new GetByIdUserController(getbyidUserCase);

  return getbyidUserController;
};
