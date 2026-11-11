import { PrismaProposalRepository } from "../../../../repositories/in-prisma/proposal-in-prisma-repository";
import prismaClient from "../../../../services/prisma-client";
import { reportAuthorizerFactory } from "../report-authorizer-factory";
import { ReportController } from "../report-controller";
import { GetEventProfileReportUseCase } from "./use-case-get-event-profile-report";

export const getEventProfileReportFactory = () =>
    new ReportController(
        new GetEventProfileReportUseCase(new PrismaProposalRepository(prismaClient), reportAuthorizerFactory()),
    );
