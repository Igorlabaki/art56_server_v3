import { PrismaClient, Schedule } from "@prisma/client";
import { ScheduleRepositoryInterface } from "../interface/schedule-repository-interface";
import { CreateScheduleDbParams } from "../../zod/schedule/create-schedule-params-db-schema";
import { ListScheduleRequestQuerySchema } from "../../zod/schedule/list-schedule-query-schema";
import { UpdateScheduleRequestParams } from "../../zod/schedule/update-schedule-params-schema";
import { UpdateScheduleDbSchemaParams } from "../../zod/schedule/update-schedule-db-params-schema";

export class PrismaScheduleRepository implements ScheduleRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }
  
  async create({proposalId,...rest}: CreateScheduleDbParams): Promise<Schedule | null> {
    return await this.prisma.schedule.create({
      data: {
        proposal :{
          connect:{
            id: proposalId
          }
        },
        ...rest
      },
    });
  }

  async delete(reference: string): Promise<Schedule | null> {
    return await this.prisma.schedule.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<Schedule | null> {
    return await this.prisma.schedule.findFirst({
      where: {
        id: reference,
      },
    });
  }

  async update({ data, scheduleId }: UpdateScheduleDbSchemaParams): Promise<Schedule | null> {
    return await this.prisma.schedule.update({
      where: {
        id: scheduleId,
      },
      data: {
        ...data
      },
    });
  }

  async list({ proposalId, name }: ListScheduleRequestQuerySchema): Promise<Schedule[]> {
    return await this.prisma.schedule.findMany({
      where: {
        ...(name && {
          name: {
            contains: name
          }
        }),
        proposalId
      },
      orderBy: {
        startHour: "asc",
      },
    });
  }
}
