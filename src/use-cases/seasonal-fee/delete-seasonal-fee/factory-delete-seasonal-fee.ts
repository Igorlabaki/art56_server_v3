import { PrismaSeasonalFeeRepository } from "../../../repositories/in-prisma/seasonal-fee-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { DeleteSeasonalFeeController } from "./controller-delete-seasonal-fee";
import { DeleteSeasonalFeeUseCase } from "./use-case-delete-seasonal-fee";

export const deleteSeasonalFeeFactory = () => {
  const prismaSeasonalFeeRepository = new PrismaSeasonalFeeRepository(prismaClient);
  const deleteSeasonalFeeCase = new DeleteSeasonalFeeUseCase(prismaSeasonalFeeRepository);
  const deleteSeasonalFeeController = new DeleteSeasonalFeeController(deleteSeasonalFeeCase);

  return deleteSeasonalFeeController;
};
