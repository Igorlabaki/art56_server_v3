import { PrismaClient, Service } from "@prisma/client"
import { ServiceRepositoryInterface } from "../interface/service-repository-interface"
import { ServiceForQuote } from "../../functions/quote-service-lines"
import { CreateServiceRequestParams } from "../../zod/services/create-service-params-schema"
import { ListServiceRequestQuerySchema } from "../../zod/services/list-service-query-schema"
import { UpdateServiceRequestParams } from "../../zod/services/update-service-params-schema"
import { GetByNameServiceSchema } from "../../zod/services/get-by-name-service-params-schema"

export class PrismaServiceRepository implements ServiceRepositoryInterface {

    constructor (private readonly prisma: PrismaClient){}
  
    async create (params: CreateServiceRequestParams): Promise<Service | null> {
      return await this.prisma.service.create({
        data:{
          ...params,
        },
      })
    }
  
   async update (reference: UpdateServiceRequestParams): Promise<Service  | null> {
      return await this.prisma.service.update({
        where:{
          id: reference.serviceId
        },
        data:{
          ...reference.data
        }
      })
    } 

    async getByVenueId (reference: string): Promise<Service [] | null> {
      return await this.prisma.service.findMany({
        where:{
          venueId: reference
        }
      })
    }

    async getById (reference: string): Promise<Service | null> {
      return await this.prisma.service.findFirst({
        where:{
          id: reference
        }
      })
    }

    async getByName ({name,venueId}: GetByNameServiceSchema): Promise<Service | null> {
      return await this.prisma.service.findFirst({
        where:{
          name,
          venueId
        }
      })
    }

    async listForQuote(venueId: string, serviceIds: string[]): Promise<ServiceForQuote[]> {
      if (!serviceIds.length) return []
      const rows = await this.prisma.service.findMany({
        where: {
          venueId,
          id: { in: serviceIds },
        },
        select: {
          id: true,
          venueId: true,
          price: true,
          pricingType: true,
        },
      })
      return rows.map((row) => ({
        id: row.id,
        venueId: row.venueId,
        price: row.price,
        pricingType: row.pricingType,
      }))
    }

    async delete (reference: string): Promise<Service | null> {
      return await this.prisma.service.delete({
        where:{
            id: reference
        }
      })
    }

    async list ({venueId,name}: ListServiceRequestQuerySchema): Promise<Service[] | null> {
      return await this.prisma.service.findMany({
        where: {
          venueId,
          ...(name && {
            name: {
              contains: name
            }
          }),
        },
      })
    }
  }