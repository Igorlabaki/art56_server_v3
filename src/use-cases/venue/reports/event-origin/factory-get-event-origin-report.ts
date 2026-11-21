import { PrismaProposalRepository } from "../../../../repositories/in-prisma/proposal-in-prisma-repository";
import prismaClient from "../../../../services/prisma-client";
import { reportAuthorizerFactory } from "../report-authorizer-factory";
import { ReportController } from "../report-controller";
import { GetEventOriginReportUseCase } from "./use-case-get-event-origin-report";

export const getEventOriginReportFactory = () =>
    new ReportController(
        new GetEventOriginReportUseCase(new PrismaProposalRepository(prismaClient), reportAuthorizerFactory()),
    );
