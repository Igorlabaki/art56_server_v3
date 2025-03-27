import { PrismaClient, SeasonalFee } from "@prisma/client";
import { SeasonalFeeRepositoryInterface } from "../interface/seasonal-fee-repository-interface";
import { CreateSeasonalFeeRequestParams } from "../../zod/seasonalFee/create-seasonal-fee-params-schema";
import { UpdateSeasonalFeeRequestParams } from "../../zod/seasonalFee/update-seasonal-fee-params-schema";
import { ListSeasonalFeeRequestQuerySchema } from "../../zod/seasonalFee/list-seasonal-fee-query-schema";


export class PrismaSeasonalFeeRepository implements SeasonalFeeRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async create(params: CreateSeasonalFeeRequestParams): Promise<SeasonalFee | null> {
    return await this.prisma.seasonalFee.create({
      data: {
        ...params,
      },
    });
  }

  async delete(reference: string): Promise<SeasonalFee | null> {
    return await this.prisma.seasonalFee.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<SeasonalFee | null> {
    return await this.prisma.seasonalFee.findFirst({
      where: {
        id: reference,
      },
    });
  }

  async getByTitle({venueId,title,seasonalFeeId}: {title: string, venueId: string, seasonalFeeId?: string}): Promise<SeasonalFee | null> {
    return await this.prisma.seasonalFee.findFirst({
      where: {
        AND: [
          { title },
          { venueId },
        ],
        ...(seasonalFeeId && {
          NOT: [
            { id: seasonalFeeId }
          ]
        }),
        
      },
    });
  }

  async update({ data, seasonalFeeId }: UpdateSeasonalFeeRequestParams): Promise<SeasonalFee | null> {
    return await this.prisma.seasonalFee.update({
      where: {
        id: seasonalFeeId,
      },
      data: {
        ...data,
      },
    });
  }

  async list({ venueId, title,type }: ListSeasonalFeeRequestQuerySchema): Promise<SeasonalFee[]> {
    return await this.prisma.seasonalFee.findMany({
      where: {
        ...(title && {
          title: {
            contains: title
          }
        }),
        type,
        venueId
      },
    });
  }
}
