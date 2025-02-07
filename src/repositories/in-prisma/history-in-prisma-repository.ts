import { PrismaClient, History } from "@prisma/client";
import { HistoryRepositoryInterface } from "../interface/history-repository-interface";
import { CreateHistoryRequestParams } from "../../zod/history/create-history-params-schema";

export class PrismaHistoryRepository implements HistoryRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create(params: CreateHistoryRequestParams): Promise<History | null> {
    const { userId,username, proposalId, ...rest } = params
    return await this.prisma.history.create({
      data: {
        ...rest,
        ...(userId && { user: { connect: { id: userId } }, username: username }),
        proposal:{
          connect:{
            id: proposalId
          }
        }
      },
    })
  }

  async getById(reference: string): Promise<History | null> {
    return await this.prisma.history.findFirst({
      where: {
        id: reference
      }
    })
  }

  async delete(reference: string): Promise<History | null> {
    return await this.prisma.history.delete({
      where: {
        id: reference
      }
    })
  }

  async list(reference: string): Promise<History[] | null> {
    return await this.prisma.history.findMany({
      where: {
        proposalId: reference
      }
    })
  }
}