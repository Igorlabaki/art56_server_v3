import prismaClient from "../../../services/prisma-client";
import { ListDateEventsUseCase } from "./use-case-list-date-event";
import { ListDateEventController } from "./controller-list-date-event";
import { PrismaDateEventRepository } from "../../../repositories/in-prisma/date-event-in-prisma-repository";

export const listDateEventFactory = (): ListDateEventController => {
    const prismaDateEventRepository = new PrismaDateEventRepository(prismaClient);
    const listDateEventUseCase = new ListDateEventsUseCase(prismaDateEventRepository);
    const listDateEventController = new ListDateEventController(listDateEventUseCase);

    return listDateEventController;
};
