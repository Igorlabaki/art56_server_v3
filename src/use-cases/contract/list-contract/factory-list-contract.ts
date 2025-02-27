import prismaClient from "../../../service/prisma-client";
import { ListContractsUseCase } from "./use-case-list-contract";
import { ListContractController } from "./controller-list-contract";
import { PrismaContractRepository } from "../../../repositories/in-prisma/contract-in-prisma-repository";

export const listContractFactory = (): ListContractController => {
    const prismaContractRepository = new PrismaContractRepository(prismaClient);
    const listContractUseCase = new ListContractsUseCase(prismaContractRepository);
    const listContractController = new ListContractController(listContractUseCase);

    return listContractController;
};
