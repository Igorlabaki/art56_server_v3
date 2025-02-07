import prismaClient from "../../../service/prisma-client";
import { DeleteDateEventUseCase } from "./use-case-delete-data-event";
import { DeleteDateEventController } from "./controller-delete-date-event";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaDateEventRepository } from "../../../repositories/in-prisma/date-event-in-prisma-repository";

export const deleteDateEventFactory = () => {
  const prismaDateEventRepository = new PrismaDateEventRepository(prismaClient);
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const deleteDateEventCase = new DeleteDateEventUseCase(prismaDateEventRepository,prismaProposalRepository);
  const deleteDateEventController = new DeleteDateEventController(deleteDateEventCase);

  return deleteDateEventController;
};
