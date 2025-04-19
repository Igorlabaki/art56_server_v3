import { Person } from "@prisma/client";
import { CreatePersonRequestParams } from "../../zod/person/create-person-params-schema";
import { ListPersonRequestQuerySchema } from "../../zod/person/list-person-query-schema";
import { UpdatePersonRequestParams } from "../../zod/person/update-person-params-schema";
import { CreateManyPersonSchema } from "../../zod/person/create-many-person-params-schema";

export interface PersonRepositoryInterface {
  delete: (params: string) => Promise<Person | null>;  
  getById: (params: string) => Promise<Person | null>;
  update: (params: UpdatePersonRequestParams) => Promise<Person | null>;
  create: (params: CreatePersonRequestParams) => Promise<Person | null>;
  list: (params: ListPersonRequestQuerySchema) => Promise<Person[]  | null>;
  createMany: (params: CreateManyPersonSchema) => Promise<{list: Person[], count: number} | null>;
}