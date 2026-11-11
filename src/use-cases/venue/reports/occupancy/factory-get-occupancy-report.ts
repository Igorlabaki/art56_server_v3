import { PrismaDateEventRepository } from "../../../../repositories/in-prisma/date-event-in-prisma-repository";
import prismaClient from "../../../../services/prisma-client";
import { reportAuthorizerFactory } from "../report-authorizer-factory";
import { ReportController } from "../report-controller";
import { GetOccupancyReportUseCase } from "./use-case-get-occupancy-report";

export const getOccupancyReportFactory = () =>
    new ReportController(
        new GetOccupancyReportUseCase(new PrismaDateEventRepository(prismaClient), reportAuthorizerFactory()),
    );
