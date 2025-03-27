import { Person, Payment, Proposal, Service } from "@prisma/client";
import { ListProposalRequestQuerySchema } from "../../zod/proposal/list-proposal-query-schema";
import { UpdateProposalInDbParam } from "../../zod/proposal/update-proposal-in-db-params-schema";
import { GetTrafficCountVenueDbSchema } from "../../zod/venue/get-venue-traffic-count-db-schema";
import { GetVenueAnalysisByMonthDbSchema } from "../../zod/venue/get-venue-analysis-by-month-db-schema";
import { UpdatePersonalInfoProposalSchema } from "../../zod/proposal/update-personal-info-proposal-params-schema";

export interface CreateProposalInDbParams {
  completeClientName: string
  endDate: Date
  guestNumber: number
  startDate: Date
  venueId: string
  email: string
  whatsapp: string
  basePrice: number
  type: ProposalType
  serviceIds?: string[] | []
  description: string
  totalAmount: number
  knowsVenue: boolean
  extraHoursQty: number
  extraHourPrice: number
  trafficSource: TrafficSource
}

export type ProposalWithRelations = Proposal & {
  proposalServices: {
    service: Service;
  }[];
  payments: Payment[]; 
  personList: Person[];
};

export interface ItemListProposalResponse{
  id: string,
  completeClientName: string,
  email: string,
  totalAmount: number,
}

export interface UpdateProposalServices{
  proposalId: string;
  serviceIds: string[]
}

export interface TrafficSourceTypes {
  all: number;
  other: number;
  google: number;
  friend: number;
  tikTok: number;
  facebook: number;
  instagram: number;
}

export interface TrafegoCountResponse {
  all: number;
  sortedSources: { name: string; count: number }[];
}

export interface MonthProposalDataCount{
  year: number
}

type TrafficSource = "AIRBNB" | "GOOGLE" | "INSTAGRAM" | "TIKTOK" | "OTHER" | "FRIEND" | "FACEBOOK";

type ProposalType = "EVENT" | "OTHER" | "BARTER" | "PRODUCTION" | "OVERNIGHT"

export interface ProposalRepositoryInterface {
  delete: (params: string) => Promise<Proposal | null>
  getById: (params: string) => Promise<ProposalWithRelations | null>
  update: (params: UpdateProposalInDbParam) => Promise<Proposal | null> 
  updateServices: (params: UpdateProposalServices) => Promise<Proposal | null> 
  createPerDay: (params: CreateProposalInDbParams) => Promise<Proposal | null>
  createPerPerson: (params: CreateProposalInDbParams) => Promise<Proposal | null>
  analysisByMonth: (params: GetVenueAnalysisByMonthDbSchema) => Promise<Proposal[] | null>
  updatePersonalInfo: (params: UpdatePersonalInfoProposalSchema) => Promise<Proposal | null> 
  trafficCount: (params: GetTrafficCountVenueDbSchema) => Promise<TrafegoCountResponse | null>
  list: (params: ListProposalRequestQuerySchema) => Promise<ItemListProposalResponse[] | null>
}