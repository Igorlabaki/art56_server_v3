import prismaClient from "../../../service/prisma-client";

import { GetUserByIdUseCase } from "./use-case-get-user-by-id";
import { GetUserByIdController } from "./controller-get-user-by-id";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";

export const getUserByidFactory = () => {
  const prismaUserRepository = new PrismaUserRepository(prismaClient);
  const getUserByidUseCase = new GetUserByIdUseCase(prismaUserRepository);
  const getUserByidController = new GetUserByIdController(getUserByidUseCase);

  return getUserByidController;
};
