import { SeasonalFee } from "@prisma/client";
import { UpdateSeasonalFeeRequestParams } from "../../zod/seasonalFee/update-seasonal-fee-params-schema";
import { CreateSeasonalFeeRequestParams } from "../../zod/seasonalFee/create-seasonal-fee-params-schema";
import { ListSeasonalFeeRequestQuerySchema } from "../../zod/seasonalFee/list-seasonal-fee-query-schema";

export interface SeasonalFeeRepositoryInterface {
  delete: (params: string) => Promise<SeasonalFee | null>;  
  getById: (params: string) => Promise<SeasonalFee | null>;
  update: (params: UpdateSeasonalFeeRequestParams) => Promise<SeasonalFee | null>;
  create: (params: CreateSeasonalFeeRequestParams) => Promise<SeasonalFee | null>;
  list: (params: ListSeasonalFeeRequestQuerySchema) => Promise<SeasonalFee[]  | null>;
  getByTitle: (params: {title: string, venueId: string, seasonalFeeId?: string }) => Promise<SeasonalFee | null>
}