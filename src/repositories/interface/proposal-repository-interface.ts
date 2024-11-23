import { Proposal, User } from "@prisma/client";

export interface CreateProposalInDbParams {
  name: string
  endDate: Date
  email: string
  guests: number
  startDate: Date
  venueId: string
  whatsapp: string
  basePrice: number
  type: ProposalType
  serviceIds?: string[] | []
  description: string
  totalAmount: number
  knowsVenue: boolean
  extraHoursQty: number
  extraHourPrice: number
  termsAccepted: boolean
  trafficSource: TrafficSource
}

type TrafficSource = "AIRBNB" | "GOOGLE" | "INSTAGRAM" | "TIKTOK" | "OUTROS" | "AMIGO" | "FACEBOOK";

type ProposalType = "EVENT" | "OTHER" | "BARTER" | "PRODUCTION"

export interface ProposalRepositoryInterface {
  list: (params: string) => Promise<Proposal[] | null>
  delete: (params: string) => Promise<Proposal | null>
  getById: (params: string) => Promise<Proposal | null>
  /* update: (params: UpdateProposalRequestParams) => Promise<Proposal | null> */
  create: (params: CreateProposalInDbParams) => Promise<Proposal | null>
}