import { PrismaClient, Contract, Clause } from "@prisma/client";
import { ContractRepositoryInterface } from "../interface/contract-repository-interface";
import { CreateContractRequestParams } from "../../zod/contract/create-contract-params-schema";
import { ListContractRequestQuerySchema } from "../../zod/contract/list-contract-query-schema";
import { UpdateContractRequestParams } from "../../zod/contract/update-contract-params-schema";

export class PrismaContractRepository implements ContractRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async create({ clauses, organizationId, venueIds, ...params }: CreateContractRequestParams): Promise<Contract | null> {
    return await this.prisma.contract.create({
      data: {
        organization: {
          connect: {
            id: organizationId
          }
        },
        ...(venueIds && {
          venues: {
            connect: venueIds?.map((id: string) => ({ id })), // Conecta os múltiplos venues
          }
        }),
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
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      select: {
        clauses: { select: { id: true } }, // Buscar cláusulas associadas ao contrato
      },
    });
  
    return contract?.clauses || null; // Retorna as cláusulas ou null se não houver contrato
  }

  async update({ clauses, contractId, venueIds, ...rest }: UpdateContractRequestParams): Promise<Contract | null> {
    const existingVenues = await this.prisma.contract.findUnique({
      where: { id: contractId },
      select: { venues: { select: { id: true } } },
    });
  
    if (!existingVenues) {
      throw new Error("Contrato não encontrado");
    }
  
    await this.prisma.contract.update({
      where: { id: contractId },
      data: {
        ...(venueIds && {
          venues: {
            set: venueIds.map(id => ({ id })), // Define os venues diretamente
          },
        }),
        ...rest,
      },
    });
  
    // 1. Buscar as cláusulas existentes associadas ao contrato
    const existingClauses = await this.prisma.contract.findUnique({
      where: { id: contractId },
      select: { clauses: { select: { id: true } } },
    });
  
    const existingClauseIds = existingClauses?.clauses.map(clause => clause.id) || [];
    const incomingClauseIds = clauses.map(clause => clause.id).filter(Boolean);
  
    // 2. Identificar cláusulas para exclusão (presentes no banco, mas não na lista recebida)
    const clausesToDisconnect = existingClauseIds.filter(id => !incomingClauseIds.includes(id));
  
    // 3. Atualizar o contrato para remover cláusulas não enviadas
    await this.prisma.contract.update({
      where: { id: contractId },
      data: {
        clauses: {
          disconnect: clausesToDisconnect.map(id => ({ id })), // Remove cláusulas que não estão na nova lista
        },
      },
    });
  
    // 4. Criar ou atualizar cláusulas
    const updatePromises = clauses.map(clause => {
      if (clause.id && existingClauseIds.includes(clause.id)) {
        // Atualizar cláusula existente
        return this.prisma.clause.update({
          where: { id: clause.id },
          data: {
            text: clause.text,
            title: clause.title,
            position: clause.position ? Number(clause.position) : null,
          },
        });
      } else {
        // Criar nova cláusula e associar ao contrato
        return this.prisma.clause.create({
          data: {
            text: clause.text,
            title: clause.title,
            position: clause.position ? Number(clause.position) : null,
            contracts: { connect: { id: contractId } }, // Relaciona corretamente
          },
        });
      }
    });
  
    await Promise.all(updatePromises);
  
    // 5. Retornar o contrato atualizado com as cláusulas e venues
    return this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { 
        clauses: true, 
        venues: { select: { id: true } },
      },
    });
  }


  async list({ organizationId, title, venueId }: ListContractRequestQuerySchema): Promise<Contract[]> {
    return await this.prisma.contract.findMany({
      where: {
        ...(title && {
          contract: {
            contains: title
          }
        }),
        ...(venueId && {
          venues:{
            some:{
              id: venueId
            }
          }
        }),
        organizationId,
      },
      include: {
        clauses: true,
        venues: {
          select: {
            id: true,
          }
        }
      }
    });
  }
}
