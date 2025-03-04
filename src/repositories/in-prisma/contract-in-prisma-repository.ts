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
        clauses: {
          orderBy: {
            position: "asc"
          }
        }
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

  async update({ clauses, contractId,...rest }: UpdateContractRequestParams): Promise<Contract | null> {
    await this.prisma.contract.update({
      where: { 
        id: contractId
       },
      data:{
        ...rest
      }
    });

    // 1. Buscar as cláusulas existentes no banco
    const existingClauses = await this.prisma.clause.findMany({
      where: { contractId },
      select: { id: true },
    });

    // 2. Extrair os IDs das cláusulas existentes
    const existingClauseIds = existingClauses.map((clause) => clause.id);

    // 3. Extrair os IDs das cláusulas recebidas
    const incomingClauseIds = clauses.map((clause) => clause.id).filter((id) => id);

    // 4. Identificar cláusulas para exclusão (presentes no banco, mas não na lista recebida)
    const clausesToDelete = existingClauseIds.filter((id) => !incomingClauseIds.includes(id));

    // 5. Excluir cláusulas que não estão mais na lista
    const deletePromises = clausesToDelete.map((id) => {
      return this.prisma.clause.delete({
        where: { id },
      });
    });

    // 6. Identificar cláusulas para atualização ou criação
    const updatePromises = clauses.map((clause) => {
      if (clause.id && existingClauseIds.includes(clause.id)) {
        // Atualizar cláusula existente
        return this.prisma.clause.update({
          where: { id: clause.id },
          data: {
            text: clause.text,
            title: clause.title,
            position: Number(clause.position),
          },
        });
      } else {
        // Criar nova cláusula
        return this.prisma.clause.create({
          data: {
            text: clause.text,
            title: clause.title,
            position: Number(clause.position),
            contractId, // Associar ao contrato
          },
        });
      }
    });

    // 7. Executar todas as operações de exclusão, atualização e criação
    await Promise.all([...deletePromises, ...updatePromises]);

    // 8. Retornar o contrato atualizado com as cláusulas
    return await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { clauses: true },
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
