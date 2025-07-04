import { Venue, User, Question, Image, Text, Service } from "@prisma/client";

import { CreateVenueDbSchema } from "../../zod/venue/create-venue-db-schema";
import { GetVenueByIdRequestParamSchema } from "../../zod/venue/get-by-id-venue-param-schema";
import { ListVenueRequestQuerySchema } from "../../zod/venue/list-venue-query-schema";
import { ListPermittedVenueRequestQuerySchema } from "../../zod/venue/list-venue-permitted-query-schema";

import { GetVenueAnalyticsParams } from "../../zod/venue/get-venue-analytics-params-schema";
import { UpdateVenueSchemaDb } from "../../zod/venue/update-venue-params-schema";
import { GetHubDataRequestParamSchema } from "../../zod/venue/get-hub-data-request-param";
import { GetSelectedVenueRequestParamSchema } from "../../zod/venue/get-selected-venue-param-schema";

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

export interface WebDataResponse  {
  id: string;
  minimumNights: number | null;
  maxGuest: number;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  logoUrl: string | null;
  email: string | null;
  name: string;
  whatsappNumber: string | null;
  images: Image[];
  texts: Text[];
  questions: Question[];
  services: Service[];
};
export interface HubDataResponse  {
  id: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  logoUrl: string | null;
  name: string;
  whatsappNumber: string | null;
  images: Image[];
  texts: Text[];
  email: string | null;
};
export interface VenueRepositoryInterface {
  delete: (params: string) => Promise<Venue | null>
  update: (params: UpdateVenueSchemaDb) => Promise<Venue | null>
  create: (params: CreateVenueDbSchema
  ) => Promise<Venue | null>
  getById: (params: GetVenueByIdRequestParamSchema) => Promise<Venue | null>
  getSelectedVenue: (params: GetSelectedVenueRequestParamSchema) => Promise<Venue | null>
  getWebData: (params: GetSelectedVenueRequestParamSchema) => Promise<WebDataResponse | null>
  getHubData: (params: GetHubDataRequestParamSchema) => Promise<HubDataResponse[] | null>
  list: (query: ListVenueRequestQuerySchema) => Promise<ItemListVenueResponse[] | null>
  listPermitted: (query: ListPermittedVenueRequestQuerySchema) => Promise<ItemListVenueResponse[] | null>
  getVenueAnalytics: (params: GetVenueAnalyticsParams) => Promise<VenueAnalyticsResponse | null>
}