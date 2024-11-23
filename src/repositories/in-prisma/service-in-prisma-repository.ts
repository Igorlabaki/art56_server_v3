import { PrismaClient, Service } from "@prisma/client"
import { GetByProposalServiceListTotalAmount, ServiceRepositoryInterface } from "../interface/service-repository-interface"
import { CreateServiceRequestParams } from "../../zod/services/create-service-params-schema"

export class PrismaServiceRepository implements ServiceRepositoryInterface {

    constructor (private readonly prisma: PrismaClient){}
  
    async create (params: CreateServiceRequestParams): Promise<Service | null> {
      return await this.prisma.service.create({
        data:{
          ...params,
        },
      })
    }
  
   /*  async update (reference: UpdateServiceRequestParams): Promise<Service  | null> {
      return await this.prisma.service.update({
        where:{
          id: reference.serviceId
        },
        data:{
          ...reference.data
        }
      })
    } */

    async getByVenueId (reference: string): Promise<Service [] | null> {
      return await this.prisma.service.findMany({
        where:{
          venueId: reference
        }
      })
    }

    async getByProposalServiceListTotalAmount({serviceIds,venueId}:GetByProposalServiceListTotalAmount): Promise<number | null> {
      const result = await this.prisma.service.aggregate({
        _sum: {
          price: true, 
        },
        where: {
          venueId: venueId,
          id: {
            in: serviceIds, 
          },
        },
      });
    
      return result._sum.price || 0;
    }

    async delete (reference: string): Promise<Service | null> {
      return await this.prisma.service.delete({
        where:{
            id: reference
        }
      })
    }

    async list (reference: string): Promise<Service[] | null> {
      return await this.prisma.service.findMany({
        
      })
    }
  }