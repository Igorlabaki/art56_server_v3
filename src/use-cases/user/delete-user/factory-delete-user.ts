import prismaClient from "../../../service/prisma-client";

import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";
import { DeleteUserUseCase } from "../../user/delete-user/use-case-delete-user";
import { DeleteUserController } from "../../user/delete-user/controller-delete-user";

export const deleteUserFactory = () => {
  const prismaUserRepository = new PrismaUserRepository(prismaClient);
  const deleteUserCase = new DeleteUserUseCase(prismaUserRepository);
  const deleteUserController = new DeleteUserController(deleteUserCase);

  return deleteUserController;
};
