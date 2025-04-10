import { Goal } from "@prisma/client";
import { ListGoalRequestQuerySchema } from "../../zod/goal/list-goal-query-schema";
import { UpdateGoalRequestParams } from "../../zod/goal/update-goal-params-schema";
import { VerifyGoalRequestParams } from "../../zod/goal/verify-goal-params-schema";
import { CreateGoalDbRequestParams } from "../../zod/goal/create-goal-db-params-schema";

export interface GoalRepositoryInterface {
  delete: (params: string) => Promise<Goal | null>;  
  getById: (params: string) => Promise<Goal | null>;
  update: (params: UpdateGoalRequestParams) => Promise<Goal | null>;
  create: (params: CreateGoalDbRequestParams) => Promise<Goal | null>;
  list: (params: ListGoalRequestQuerySchema) => Promise<Goal[]  | null>;
  verifyIfGoalAlreadyExists: (params: VerifyGoalRequestParams) => Promise<Goal  | null>;
}