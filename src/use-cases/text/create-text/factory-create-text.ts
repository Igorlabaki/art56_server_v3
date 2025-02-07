import prismaClient from "../../../service/prisma-client";
import { CreateTextUseCase } from "./use-case-create-text";
import { CreateTextController } from "./controller-create-text";
import { PrismaTextRepository } from "../../../repositories/in-prisma/text-in-prisma-repository";

export const createTextFactory = () => {
  const prismaTextRepository = new PrismaTextRepository(prismaClient);
  const createTextsCase = new CreateTextUseCase(prismaTextRepository); 
  const createTextController = new CreateTextController(createTextsCase);

  return createTextController;
};
