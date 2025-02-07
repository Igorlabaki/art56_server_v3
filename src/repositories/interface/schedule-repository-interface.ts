import { Schedule } from "@prisma/client";
import { CreateScheduleDbParams } from "../../zod/schedule/create-schedule-params-db-schema";
import { ListScheduleRequestQuerySchema } from "../../zod/schedule/list-schedule-query-schema";
import { UpdateScheduleDbSchemaParams } from "../../zod/schedule/update-schedule-db-params-schema";

export interface ScheduleRepositoryInterface {
  delete: (params: string) => Promise<Schedule | null>;  
  getById: (params: string) => Promise<Schedule | null>;
  create: (params: CreateScheduleDbParams) => Promise<Schedule | null>;
  update: (params: UpdateScheduleDbSchemaParams) => Promise<Schedule | null>;
  list: (params: ListScheduleRequestQuerySchema) => Promise<Schedule[]  | null>;
}