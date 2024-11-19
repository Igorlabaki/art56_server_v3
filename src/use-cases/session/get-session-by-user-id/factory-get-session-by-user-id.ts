import prismaClient from "../../../service/prisma-client";

import { GetSessionByUserIdUseCase } from "./use-case-get-session-user-by-id";
import { GetSessionByUserIdController } from "./controller-get-session-by-id";
import { PrismaSessionRepository } from "../../../repositories/in-prisma/session-in-prisma-repository";

export const getSessionByidFactory = () => {
  const prismaSessionRepository = new PrismaSessionRepository(prismaClient);
  const getSessionByidUseCase = new GetSessionByUserIdUseCase(prismaSessionRepository);
  const getSessionByidController = new GetSessionByUserIdController(getSessionByidUseCase);

  return getSessionByidController;
};
