import prismaClient from "../../../service/prisma-client";
import { CreateNewUserUseCase } from "./use-case-create-new-user";
import { CreateNewUserController } from "./controller-create-new-user";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";

export const createNewUserFactory = () => {
  const prismaUserRepository = new PrismaUserRepository(prismaClient);
  const createUsersCase = new CreateNewUserUseCase(prismaUserRepository); 
  const createUserController = new CreateNewUserController(createUsersCase);

  return createUserController;
};
