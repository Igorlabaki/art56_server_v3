import { PrismaProposalRepository } from "../../../../repositories/in-prisma/proposal-in-prisma-repository";
import prismaClient from "../../../../services/prisma-client";
import { reportAuthorizerFactory } from "../report-authorizer-factory";
import { ReportController } from "../report-controller";
import { GetLeadTimeReportUseCase } from "./use-case-get-lead-time-report";

export const getLeadTimeReportFactory = () =>
    new ReportController(
        new GetLeadTimeReportUseCase(new PrismaProposalRepository(prismaClient), reportAuthorizerFactory()),
    );
