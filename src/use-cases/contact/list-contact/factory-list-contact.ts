import prismaClient from "../../../services/prisma-client";
import { ListContactsUseCase } from "./use-case-list-contact";
import { ListContactController } from "./controller-list-contact";
import { PrismaContactRepository } from "../../../repositories/in-prisma/contact-in-prisma-repository";

export const listContactFactory = (): ListContactController => {
    const prismaContactRepository = new PrismaContactRepository(prismaClient);
    const listContactUseCase = new ListContactsUseCase(prismaContactRepository);
    const listContactController = new ListContactController(listContactUseCase);

    return listContactController;
};
