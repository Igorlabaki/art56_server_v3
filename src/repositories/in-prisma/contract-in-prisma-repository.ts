import { PrismaClient, Contract, Clause } from "@prisma/client";
import { ContractRepositoryInterface } from "../interface/contract-repository-interface";
import { CreateContractRequestParams } from "../../zod/contract/create-contract-params-schema";
import { ListContractRequestQuerySchema } from "../../zod/contract/list-contract-query-schema";
import { UpdateContractRequestParams } from "../../zod/contract/update-contract-params-schema";

export class PrismaContractRepository implements ContractRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async create({ clauses, organizationId, ...params }: CreateContractRequestParams): Promise<Contract | null> {
    return await this.prisma.contract.create({
      data: {
        organization: {
          connect: {
            id: organizationId
          }
        },
        clauses: {
          create: clauses.map((data: { text: string, title: string, position: number }) => ({
            text: data.text,
            title: data.title,
            position: Number(data.position),
          })),
        },
        ...params,
      },
      include: {
        clauses: true
      }
    });
  }

  async delete(reference: string): Promise<Contract | null> {
    return await this.prisma.contract.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<Contract | null> {
    return await this.prisma.contract.findFirst({
      where: {
        id: reference,
      },
      include: {
        clauses: true
      }
    });
  }

  async getClauseByContract(contractId: string): Promise<{ id: string }[] | null> {
    return await this.prisma.clause.findMany({
      where: {
        contractId
      },
      select: {
        id: true,  // Apenas os IDs serão retornados
      },
    });
  }

  async update({ clauses, contractId }: UpdateContractRequestParams): Promise<Contract | null> {
    // 1. Buscar as cláusulas existentes no banco
    const existingClauses = await this.prisma.clause.findMany({
      where: { contractId },
      select: { id: true },
    });

    const incomingClauseIds = clauses.map((clause: any) => clause.id).filter((id: any) => id);

    const clausesToDelete = existingClauses.filter(id => !incomingClauseIds.includes(id));


    const deletePromises = clausesToDelete.map(item => {
      return this.prisma.clause.delete({
        where: {
          id: item.id
        },
      });
    });

    //
    const newClauses = clauses.filter((clause: any) => !clause.contractId);

    // 6. Criar as cláusulas novas associadas ao contrato
    const createPromises = newClauses.map((clause: any) => {
      return this.prisma.clause.create({
        data: {
          text: clause.text,
          title: clause.title,
          position: Number(clause.position),
          Contract: {
            connect: {
              id: contractId
            }
          }
        },
      });
    });

    await Promise.all([
      ...deletePromises,
      ...createPromises,
    ]);


    return await this.prisma.contract.findUnique({
      where: {
        id: contractId
      },
      include: {
        clauses: true
      }
    });
  }

  async list({ organizationId, title }: ListContractRequestQuerySchema): Promise<Contract[]> {
    return await this.prisma.contract.findMany({
      where: {
        ...(title && {
          contract: {
            contains: title
          }
        }),
        organizationId,
      },
      include: {
        clauses: true
      }
    });
  }
}
