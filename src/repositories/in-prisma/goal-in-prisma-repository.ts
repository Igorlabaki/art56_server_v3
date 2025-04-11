import { PrismaClient, Goal } from "@prisma/client";
import { GoalRepositoryInterface } from "../interface/goal-repository-interface";
import { ListGoalRequestQuerySchema } from "../../zod/goal/list-goal-query-schema";
import { UpdateGoalRequestParams } from "../../zod/goal/update-goal-params-schema";
import { CreateGoalDbRequestParams } from "../../zod/goal/create-goal-db-params-schema";
import { VerifyGoalRequestParams } from "../../zod/goal/verify-goal-params-schema";
import { ListGoalDbRequestQuerySchema } from "../../zod/goal/list-goal-db-query-schema";

export class PrismaGoalRepository implements GoalRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async verifyIfGoalAlreadyExists({minValue,venueId}: VerifyGoalRequestParams): Promise<Goal | null> {
    return await this.prisma.goal.findFirst({
     where:{
      minValue,
      venueId
     }
    });
  }

  async create(params: CreateGoalDbRequestParams): Promise<Goal | null> {
    return await this.prisma.goal.create({
      data: {
        ...params,
      },
    });
  }

  async delete(reference: string): Promise<Goal | null> {
    return await this.prisma.goal.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<Goal | null> {
    return await this.prisma.goal.findFirst({
      where: {
        id: reference,
      },
    });
  }

  async findByVenueAndRevenue(params : { venueId: string, monthlyRevenue: number,targetMonth: string}): Promise<Goal | null> {
    const goals = await this.prisma.goal.findMany({
      where: {
        venueId: params.venueId,
      },
    });
  
    return goals.find(goal => {
      const monthsArray = goal.months.split(',');
      const minValue = goal.minValue;
      const maxValue = goal.maxValue ?? Infinity;
  
      const isRevenueInRange = params.monthlyRevenue >= minValue && params.monthlyRevenue <= maxValue;
      const isMonthIncluded = monthsArray.includes(params.targetMonth);

      return isRevenueInRange && isMonthIncluded;
    }) || null;
  }

  async getByGoal({venueId,goalId,minValue}: {minValue: number, venueId: string, goalId: string | undefined}): Promise<Goal | null> {
    return await this.prisma.goal.findFirst({
      where: {
        AND: [
          { venueId: venueId },
          { minValue: minValue },
        ],
        ...(goalId && {
          NOT: [
            { id: goalId }
          ]
        }),
      },
    });
  }

  async update({ data, goalId }: UpdateGoalRequestParams): Promise<Goal | null> {
    return await this.prisma.goal.update({
      where: {
        id: goalId,
      },
      data: {
        ...data,
      },
    });
  }

  async list({ venueId, minValue }: ListGoalDbRequestQuerySchema): Promise<Goal[]> {
    return await this.prisma.goal.findMany({
      where: {
        ...(minValue && {
          minValue
        }),
        venueId
      },
    });
  }
}
