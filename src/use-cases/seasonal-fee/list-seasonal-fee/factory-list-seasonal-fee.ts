import { PrismaSeasonalFeeRepository } from "../../../repositories/in-prisma/seasonal-fee-in-prisma-repository";
import prismaClient from "../../../service/prisma-client";
import { ListSeasonalFeeController } from "./controller-list-seasonal-fee";
import { ListSeasonalFeesUseCase } from "./use-case-list-seasonal-fee";

export const listSeasonalFeeFactory = (): ListSeasonalFeeController => {
    const prismaSeasonalFeeRepository = new PrismaSeasonalFeeRepository(prismaClient);
    const listSeasonalFeeUseCase = new ListSeasonalFeesUseCase(prismaSeasonalFeeRepository);
    const listSeasonalFeeController = new ListSeasonalFeeController(listSeasonalFeeUseCase);

    return listSeasonalFeeController;
};
