import { DateEvent } from "@prisma/client";
import { CreateDateEventDbSchema } from "../../zod/dataEvent/create-date-event-db-schema";
import { ListDateEventRequestQuerySchema } from "../../zod/dataEvent/list-date-event-query-schema";
import { UpdateDateEventDbSchema } from "../../zod/dataEvent/update-date-event-db-schema";

export interface ItemListDataEventResponse {
  id: string;
  name: string;
  images: { imageUrl: string; }[]
} 

export interface ValidateDateParam {
  venueId: string;
  endDate: string | Date;
  startDate: string | Date;
}

export interface DateEventRepositoryInterface {
  delete: (params: string) => Promise<DateEvent | null>
  getById: (params: string) => Promise<DateEvent | null>
  update: (params: UpdateDateEventDbSchema) => Promise<DateEvent | null> 
  create: (params: CreateDateEventDbSchema) => Promise<DateEvent | null>
  checkAvailability: (reference: ValidateDateParam) => Promise<DateEvent | null>;
  list: (query: ListDateEventRequestQuerySchema) => Promise<DateEvent[]  | null>
}