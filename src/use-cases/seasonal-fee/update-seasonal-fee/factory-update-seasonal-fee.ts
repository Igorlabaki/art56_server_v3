import { PrismaSeasonalFeeRepository } from "../../../repositories/in-prisma/seasonal-fee-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { UpdateSeasonalFeeController } from "./controller-update-seasonal-fee";
import { UpdateSeasonalFeeUseCase } from "./use-case-update-seasonal-fee";

export const updateSeasonalFeeFactory = () => {
  const prismaSeasonalFeeRepository = new PrismaSeasonalFeeRepository(prismaClient);
  const updateSeasonalFeeCase = new UpdateSeasonalFeeUseCase(prismaSeasonalFeeRepository);
  const updateSeasonalFeeController = new UpdateSeasonalFeeController(updateSeasonalFeeCase);

  return updateSeasonalFeeController;
};
