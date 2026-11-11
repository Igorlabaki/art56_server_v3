import { PrismaProposalRepository } from "../../../../repositories/in-prisma/proposal-in-prisma-repository";
import prismaClient from "../../../../services/prisma-client";
import { reportAuthorizerFactory } from "../report-authorizer-factory";
import { ReportController } from "../report-controller";
import { GetServiceAdherenceReportUseCase } from "./use-case-get-service-adherence-report";

export const getServiceAdherenceReportFactory = () =>
    new ReportController(
        new GetServiceAdherenceReportUseCase(new PrismaProposalRepository(prismaClient), reportAuthorizerFactory()),
    );
