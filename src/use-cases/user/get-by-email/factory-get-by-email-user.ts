import prismaClient from "../../../services/prisma-client";
import { GetByEmailUserUseCase } from "./use-case-get-by-email-user";
import { GetByEmailUserController } from "./controller-get-by-email-user";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";

export const getByEmailUserFactory = () => {
  const prismaUserRepository = new PrismaUserRepository(prismaClient);
  const getbyemailUserCase = new GetByEmailUserUseCase(prismaUserRepository);
  const getbyemailUserController = new GetByEmailUserController(getbyemailUserCase);

  return getbyemailUserController;
};
