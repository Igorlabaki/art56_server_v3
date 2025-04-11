import { Goal } from "@prisma/client";
import { UpdateGoalRequestParams } from "../../zod/goal/update-goal-params-schema";
import { VerifyGoalRequestParams } from "../../zod/goal/verify-goal-params-schema";
import { CreateGoalDbRequestParams } from "../../zod/goal/create-goal-db-params-schema";
import { ListGoalDbRequestQuerySchema } from "../../zod/goal/list-goal-db-query-schema";

export interface GoalRepositoryInterface {
  delete: (params: string) => Promise<Goal | null>;  
  getById: (params: string) => Promise<Goal | null>;
  update: (params: UpdateGoalRequestParams) => Promise<Goal | null>;
  create: (params: CreateGoalDbRequestParams) => Promise<Goal | null>;
  list: (params: ListGoalDbRequestQuerySchema) => Promise<Goal[]  | null>;
  findByVenueAndRevenue: (params : { venueId: string, monthlyRevenue: number,targetMonth: string}) => Promise<Goal | null>;
  verifyIfGoalAlreadyExists: (params: VerifyGoalRequestParams) => Promise<Goal  | null>;
}

