import { PrismaExpenseRepository } from "../../../../repositories/in-prisma/expense-in-prisma-repository";
import { PrismaProposalRepository } from "../../../../repositories/in-prisma/proposal-in-prisma-repository";
import prismaClient from "../../../../services/prisma-client";
import { reportAuthorizerFactory } from "../report-authorizer-factory";
import { ReportController } from "../report-controller";
import { GetAdsReportUseCase } from "./use-case-get-ads-report";

export const getAdsReportFactory = () =>
    new ReportController(
        new GetAdsReportUseCase(
            new PrismaExpenseRepository(prismaClient),
            new PrismaProposalRepository(prismaClient),
            reportAuthorizerFactory(),
        ),
    );
