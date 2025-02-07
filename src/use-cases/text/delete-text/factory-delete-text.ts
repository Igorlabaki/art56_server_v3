import prismaClient from "../../../service/prisma-client";
import { DeleteTextUseCase } from "./use-case-delete-text";
import { DeleteTextController } from "./controller-delete-text";
import { PrismaTextRepository } from "../../../repositories/in-prisma/text-in-prisma-repository";

export const deleteTextFactory = () => {
  const prismaTextRepository = new PrismaTextRepository(prismaClient);
  const deleteTextCase = new DeleteTextUseCase(prismaTextRepository);
  const deleteTextController = new DeleteTextController(deleteTextCase);

  return deleteTextController;
};
