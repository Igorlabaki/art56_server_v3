import prismaClient from "../../../services/prisma-client";
import { UpdateTextUseCase } from "./use-case-update-text";
import { UpdateTextController } from "./controller-update-text";
import { PrismaTextRepository } from "../../../repositories/in-prisma/text-in-prisma-repository";

export const updateTextFactory = () => {
  const prismaTextRepository = new PrismaTextRepository(prismaClient);
  const updateTextCase = new UpdateTextUseCase(prismaTextRepository);
  const updateTextController = new UpdateTextController(updateTextCase);

  return updateTextController;
};
