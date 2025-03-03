import { PrismaClient, Clause } from "@prisma/client";
import { ClauseRepositoryInterface } from "../interface/clause-repository-interface";
import { CreateClauseRequestParams } from "../../zod/clause/create-clause-params-schema";
import { ListClauseRequestQuerySchema } from "../../zod/clause/list-clause-query-schema";
import { UpdateClauseRequestParams } from "../../zod/clause/update-clause-params-schema";

export class PrismaClauseRepository implements ClauseRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async create({organizationId,...params}: CreateClauseRequestParams): Promise<Clause | null> {
    return await this.prisma.clause.create({
      data: {
        organization: {
          connect: {
            id: organizationId
          }
        },
        ...params,
      },
    });
  }

  async delete(reference: string): Promise<Clause | null> {
    return await this.prisma.clause.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<Clause | null> {
    return await this.prisma.clause.findFirst({
      where: {
        id: reference,
      },
    });
  }

  async update({ data, clauseId }: UpdateClauseRequestParams): Promise<Clause | null> {
    const {title,...rest} = data
     await this.prisma.clause.updateMany({
      where: {
        title: title,
      },
      data: {
        ...rest,
      },
    });

    return this.prisma.clause.findUnique({
      where: {
        id: clauseId,
      },
    });
  }

  async list({ organizationId, title }: ListClauseRequestQuerySchema): Promise<Clause[]> {
    return await this.prisma.clause.findMany({
      where: {
        ...(title && {
          clause: {
            contains: title
          }
        }),
        ...(organizationId && {
          organizationId
        }),
      },
    });
  }
}
