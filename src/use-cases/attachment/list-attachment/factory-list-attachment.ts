import prismaClient from "../../../service/prisma-client";
import { ListAttachmentsUseCase } from "./use-case-list-attachment";
import { ListAttachmentController } from "./controller-list-attachment";
import { PrismaAttachmentRepository } from "../../../repositories/in-prisma/attachment-in-prisma-repository";

export const listAttachmentFactory = (): ListAttachmentController => {
    const prismaAttachmentRepository = new PrismaAttachmentRepository(prismaClient);
    const listAttachmentUseCase = new ListAttachmentsUseCase(prismaAttachmentRepository);
    const listAttachmentController = new ListAttachmentController(listAttachmentUseCase);

    return listAttachmentController;
};
