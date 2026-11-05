import { Person, Payment, Proposal, Service } from "@prisma/client";
import { ServiceQuoteLine } from "../../functions/quote-service-lines";
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
  email: string | null
  whatsapp: string
  basePrice: number
  type: ProposalType
  serviceIds?: string[] | []
  serviceLines?: ServiceQuoteLine[]
  description: string
  totalAmount: number
  knowsVenue: boolean
  extraHoursQty: number
  extraHourPrice: number
  trafficSource: TrafficSource
}

export type ProposalWithRelations = Proposal & {
  payments: Payment[]; 
  personList: Person[];
};

export type ProposalListStatus = "ABERTO" | "FECHADO";

export interface ProposalListRow {
  id: string;
  completeClientName: string;
  email: string | null;
  endDate: Date;
  startDate: Date;
  totalAmount: number;
  approved: boolean;
}

export interface ItemListProposalResponse extends ProposalListRow {
  status: ProposalListStatus;
}

export interface ProposalListDailyBucket {
  day: string;
  count: number;
  amount: number;
  approved: number;
}

export interface ProposalWindowDailyAmount {
  day: string;
  amount: number;
  maxAmount: number;
}

export interface ProposalWindowQuery {
  venueId: string;
  range?: { gte: Date; lt: Date };
}

export interface ListProposalDbQuery {
  venueId: string;
  completeClientName?: string;
  email?: string;
  approved?: boolean;
  minAmount?: number;
  range?: { gte: Date; lt: Date };
  sortBy: "startDate" | "totalAmount" | "status";
  sortDir: "asc" | "desc";
  skip?: number;
  take?: number;
}

export interface UpdateProposalServices{
  proposalId: string;
  serviceIds: string[]
  serviceLines?: ServiceQuoteLine[]
}

export interface TrafficSourceTypes {
  all: number;
  other: number;
  google: number;
  friend: number;
  tikTok: number;
  facebook: number;
  instagram: number;
  airbnb: number;
}

export interface TrafegoCountResponse {
  all: number;
  sortedSources: { name: string; count: number }[];
}

export interface MonthProposalDataCount{
  year: number
}
export interface MonthlyRevenueAnalysisParams{
  year: number,
  venueId: string,
  month: number,
  approved: boolean
}

type TrafficSource = "AIRBNB" | "GOOGLE" | "INSTAGRAM" | "TIKTOK" | "OTHER" | "FRIEND" | "FACEBOOK";

type ProposalType = "EVENT" | "OTHER" | "BARTER" | "PRODUCTION" | "OVERNIGHT"

export interface ProposalPresentationImage {
  id: string;
  imageUrl: string;
  description: string | null;
  position: number;
}

export interface ProposalImageCatalogItem {
  id: string;
  imageUrl: string;
  description: string | null;
  position: number;
  isShowOnProposal: boolean;
}

export interface ProposalPresentationAmenity {
  name: string;
  position: number;
}

export interface ProposalPresentation {
  name: string;
  description: string | null;
  logoUrl: string | null;
  city: string;
  state: string;
  neighborhood: string;
  street: string;
  streetNumber: string;
  maxGuest: number;
  hasOvernightStay: boolean;
  checkIn: string | null;
  checkOut: string | null;
  minimumNights: number | null;
  openingHour: string | null;
  closingHour: string | null;
  url: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  tourVideoUrl: string | null;
  whatsappNumber: string | null;
  proposalPrimaryColor: string | null;
  proposalSecondaryColor: string | null;
  proposalTextColor: string | null;
  canReorder: boolean;
  images: ProposalPresentationImage[];
  catalog: ProposalImageCatalogItem[];
  amenities: ProposalPresentationAmenity[];
}

export interface ProposalPresentationRecord extends Omit<ProposalPresentation, "canReorder" | "catalog"> {
  venueId: string;
}

export interface VenueImageForReorder {
  id: string;
  imageUrl: string;
  description: string | null;
  position: number;
}

export interface VenueImagesForReorder {
  venueId: string;
  visible: VenueImageForReorder[];
  hiddenPositions: number[];
}

export interface VenueImagesForChoice {
  venueId: string;
  images: ProposalImageCatalogItem[];
}

export interface ImageChoiceUpdate {
  id: string;
  position: number;
  isShowOnProposal: boolean;
}

export interface ProposalRepositoryInterface {
  delete: (params: string) => Promise<Proposal | null>
  getById: (params: string) => Promise<ProposalWithRelations | null>
  getPresentation: (proposalId: string) => Promise<ProposalPresentationRecord | null>
  listVenueImagesForReorder: (proposalId: string) => Promise<VenueImagesForReorder | null>
  applyImagePositions: (updates: { id: string; position: number }[]) => Promise<void>
  listVenueImageCatalog: (proposalId: string) => Promise<VenueImagesForChoice | null>
  applyImageChoice: (updates: ImageChoiceUpdate[]) => Promise<void>
  update: (params: UpdateProposalInDbParam) => Promise<Proposal | null> 
  updateServices: (params: UpdateProposalServices) => Promise<Proposal | null> 
  createPerDay: (params: CreateProposalInDbParams) => Promise<Proposal | null>
  createPerPerson: (params: CreateProposalInDbParams) => Promise<Proposal | null>
  analysisByMonth: (params: GetVenueAnalysisByMonthDbSchema) => Promise<Proposal[] | null>
  monthlyRevenueAnalysis: (params: MonthlyRevenueAnalysisParams) => Promise<number | null>
  updatePersonalInfo: (params: UpdatePersonalInfoProposalSchema) => Promise<Proposal | null> 
  trafficCount: (params: GetTrafficCountVenueDbSchema) => Promise<TrafegoCountResponse | null>
  list: (params: ListProposalDbQuery) => Promise<{ items: ProposalListRow[]; total: number }>
  summarize: (params: ListProposalDbQuery) => Promise<ProposalListDailyBucket[]>
  summarizeWindow: (params: ProposalWindowQuery) => Promise<ProposalWindowDailyAmount[]>
}