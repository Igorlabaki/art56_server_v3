import { Text } from "@prisma/client";
import { CreateTextRequestParams } from "../../zod/text/create-text-params-schema";
import { ListTextRequestQuerySchema } from "../../zod/text/list-text-query-schema";
import { UpdateTextRequestParams } from "../../zod/text/update-text-params-schema";

export interface ValidateTextAreaTitleParams {
  area: string;
  title: string;
  textId?: string;
}
export interface ValidateTextAreaPositionParams {
  area: string;
  textId?: string;
  position: number;
}

export interface TextRepositoryInterface {
  delete: (params: string) => Promise<Text | null>;  
  getById: (params: string) => Promise<Text | null>;
  update: (params: UpdateTextRequestParams) => Promise<Text | null>;
  create: (params: CreateTextRequestParams) => Promise<Text | null>;
  list: (params: ListTextRequestQuerySchema) => Promise<Text[]  | null>;
  validateIfExistTextAreaTitle: (reference: ValidateTextAreaTitleParams) => Promise<Text | null>;
  validateIfExistTextAreaPosition: (reference: ValidateTextAreaPositionParams) => Promise<Text | null>;
}