import dayjs from "dayjs"

import { PrismaClient, Proposal, Service, User } from "@prisma/client"
import { CreateProposalInDbParams, ProposalRepositoryInterface } from "../interface/proposal-repository-interface"




export class PrismaProposalRepository implements ProposalRepositoryInterface {

    constructor (private readonly prisma: PrismaClient){}
  
    async create(params: CreateProposalInDbParams): Promise<Proposal | null> {

      const {serviceIds, ...rest} = params

      return await this.prisma.proposal.create({
        data: {
          ...rest,
          proposalServices: {
            createMany: {
              data: params.serviceIds?.map((serviceId: string) => ({
                serviceId: serviceId, 
              })) || [],
            },
          },
        },
      });
    }
  
   /*  async update (reference: UpdateProposalRequestParams): Promise<Proposal  | null> {
      return await this.prisma.proposal.update({
        where:{
          id: reference.proposalId
        },
        data:{
          ...reference.data
        }
      })
    } */

    async getById (reference: string): Promise<Proposal  | null> {
      return await this.prisma.proposal.findFirst({
        where:{
          id: reference
        }
      })
    }

    async delete (reference: string): Promise<Proposal | null> {
      return await this.prisma.proposal.delete({
        where:{
            id: reference
        }
      })
    }

    async list (reference: string): Promise<Proposal[] | null> {
      return await this.prisma.proposal.findMany({
        
      })
    }
  }