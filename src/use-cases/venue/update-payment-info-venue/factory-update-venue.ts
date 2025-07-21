
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { UpdateVenuePaymentInfoController } from "./controller-update-payment-info-venue";
import { UpdatePyamentInfoVenueUseCase } from "./use-case-update-payment-info-venue";
import { PrismaClient } from "@prisma/client";

export const updateVenuePaymentInfoFactory = () => {
  const prismaVenueRepository = new PrismaVenueRepository(new PrismaClient());
  const updateVenuePaymentInfoUseCase = new UpdatePyamentInfoVenueUseCase(prismaVenueRepository);
  const updateVenuePaymentInfoController = new UpdateVenuePaymentInfoController(updateVenuePaymentInfoUseCase, prismaVenueRepository);

  return updateVenuePaymentInfoController;
};
