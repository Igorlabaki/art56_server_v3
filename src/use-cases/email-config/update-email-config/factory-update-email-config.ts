import { PrismaClient } from "@prisma/client";
import { UpdateEmailConfigController } from "./controller-update-email-config";
import { UpdateEmailConfigUseCase } from "./update-email-config-use-case";
import { PrismaEmailConfigRepository } from "../../../repositories/in-prisma/email-config-in-prisma-repository";
import { PrismaVenuePhotoRepository } from "../../../repositories/in-prisma/venue-photo-in-prisma-repository";

export const makeUpdateEmailConfigController = () => {
  const prisma = new PrismaClient();
  const emailConfigRepository = new PrismaEmailConfigRepository(prisma);
  const updateEmailConfigUseCase = new UpdateEmailConfigUseCase(
    emailConfigRepository,
    new PrismaVenuePhotoRepository(prisma),
  );
  const updateEmailConfigController = new UpdateEmailConfigController(updateEmailConfigUseCase);

  return updateEmailConfigController;
}; 