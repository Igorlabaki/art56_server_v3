import { PrismaClient, MinimumPricePeriod } from "@prisma/client";
import { MinimumPricePeriodRepositoryInterface } from "../interface/minimum-price-period-repository-interface";
import { CreateMinimumPricePeriodRequestParams } from "../../zod/minimumPricePeriod/create-minimum-price-period-params-schema";
import { UpdateMinimumPricePeriodRequestParams } from "../../zod/minimumPricePeriod/update-minimum-price-period-params-schema";

export class PrismaMinimumPricePeriodRepository implements MinimumPricePeriodRepositoryInterface {
    constructor(private readonly prisma: PrismaClient) {}

    async create(params: CreateMinimumPricePeriodRequestParams): Promise<MinimumPricePeriod> {
        return await this.prisma.minimumPricePeriod.create({
            data: params,
        });
    }

    async list(venueId: string): Promise<MinimumPricePeriod[]> {
        return await this.prisma.minimumPricePeriod.findMany({
            where: { venueId },
            orderBy: { createdAt: "asc" },
        });
    }

    async getById(id: string): Promise<MinimumPricePeriod | null> {
        return await this.prisma.minimumPricePeriod.findFirst({
            where: { id },
        });
    }

    async update(params: UpdateMinimumPricePeriodRequestParams): Promise<MinimumPricePeriod> {
        const { id, ...data } = params;
        return await this.prisma.minimumPricePeriod.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<MinimumPricePeriod> {
        return await this.prisma.minimumPricePeriod.delete({
            where: { id },
        });
    }
}
