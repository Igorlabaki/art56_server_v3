import { Venue, User } from "@prisma/client";
import { UpdateVenueSchema } from "../../zod/venue/update-venue-params-schema";
import { CreateVenueRequestParams } from "../../zod/venue/create-venue-params-schema";
import { GetVenueByIdRequestParamSchema } from "../../zod/venue/get-by-id-venue-param-schema";
import { ListVenueRequestQuerySchema } from "../../zod/venue/list-venue-query-schema";
import { ListPermittedVenueRequestQuerySchema } from "../../zod/venue/list-venue-permitted-query-schema";
import { GetSelectedVenueRequestParamSchema } from "../../zod/venue/get-selected-venue-param-schema";
import { GetVenueAnalyticsParams } from "../../zod/venue/get-venue-analytics-params-schema";

export type ItemListVenueResponse = {
  id: string;
  name: string;
  images: {
    imageUrl: string;
  }[];
  DateEvent: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    type: string;
  }[];
  _count: {
    DateEvent: number;
  };
};

export interface VenueAnalyticsResponse {
  totalEventsInYear: number;
  eventsThisMonth: number;
  proposalsInMonth: number;
  proposalsVariation: {
    value: number;
    isPositive: boolean;
  };
  totalVisits: number;
  visitsVariation: {
    value: number;
    isPositive: boolean;
  };
  monthlyRevenue: number;
  revenueVariation: {
    value: number;
    isPositive: boolean;
  };
  monthlyRevenueList: {
    month: number;
    revenue: number;
  }[] | null;
  nextEvent: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    type: string;
    proposalId: string | null;
  } | null;
  nextVisit: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    type: string;
    proposalId: string | null;
  } | null;
}

export interface VenueRepositoryInterface {
  delete: (params: string) => Promise<Venue | null>
  update: (params: UpdateVenueSchema) => Promise<Venue | null>
  create: (params: CreateVenueRequestParams) => Promise<Venue | null>
  getById: (params: GetVenueByIdRequestParamSchema) => Promise<Venue | null>
  getSelectedVenue: (params: GetSelectedVenueRequestParamSchema) => Promise<Venue | null>
  list: (query: ListVenueRequestQuerySchema) => Promise<ItemListVenueResponse[]  | null>
  listPermitted: (query: ListPermittedVenueRequestQuerySchema) => Promise<ItemListVenueResponse[]  | null>
  getVenueAnalytics: (params: GetVenueAnalyticsParams) => Promise< VenueAnalyticsResponse| null>
}