import { Text } from "@prisma/client";
import { CreateTextRequestParams } from "../../zod/text/create-text-params-schema";
import { ListTextRequestQuerySchema } from "../../zod/text/list-text-query-schema";
import { UpdateTextRequestParams } from "../../zod/text/update-text-params-schema";
import { CreateTextOrganizationSchema } from "../../zod/text-organization/create-text-organization-params-schema";
import { ListTextOrganizationRequestQuerySchema } from "../../zod/text-organization/list-text-organizations-query-schema";
import { UpdateTextOrganizationSchema } from "../../zod/text-organization/update-text-organization-params-schema";

export interface ValidateTextAreaTitleParams {
  area: string;
  title: string;
  textId?: string;
  venueId?: string;
  organizationId?: string;
}
export interface ValidateTextAreaPositionParams {
  area: string;
  textId?: string;
  position: number;
  venueId?: string;
  organizationId?: string;
}

export interface TextRepositoryInterface {
  delete: (params: string) => Promise<Text | null>;  
  getById: (params: string) => Promise<Text | null>;
  update: (params: UpdateTextRequestParams) => Promise<Text | null>;
  create: (params: CreateTextRequestParams) => Promise<Text | null>;
  list: (params: ListTextRequestQuerySchema) => Promise<Text[]  | null>;
  updateTextOrganization: (params: UpdateTextOrganizationSchema) => Promise<Text | null>;
  createTextOrganization: (params: CreateTextOrganizationSchema) => Promise<Text | null>;
  validateIfExistTextAreaTitle: (reference: ValidateTextAreaTitleParams) => Promise<Text | null>;
  listTextOrganization: (params: ListTextOrganizationRequestQuerySchema) => Promise<Text[]  | null>;
  validateIfExistTextAreaPosition: (reference: ValidateTextAreaPositionParams) => Promise<Text | null>;
}