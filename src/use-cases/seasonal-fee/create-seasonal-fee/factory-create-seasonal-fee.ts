import { PrismaSeasonalFeeRepository } from "../../../repositories/in-prisma/seasonal-fee-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { CreateSeasonalFeeController } from "./controller-create-seasonal-fee";
import { CreateSeasonalFeeUseCase } from "./use-case-create-seasonal-fee";

export const createSeasonalFeeFactory = () => {
  const prismaSeasonalFeeRepository = new PrismaSeasonalFeeRepository(prismaClient);
  const createSeasonalFeesCase = new CreateSeasonalFeeUseCase(prismaSeasonalFeeRepository); 
  const createSeasonalFeeController = new CreateSeasonalFeeController(createSeasonalFeesCase);

  return createSeasonalFeeController;
};
