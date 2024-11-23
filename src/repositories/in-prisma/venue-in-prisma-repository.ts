import dayjs from "dayjs"

import { PrismaClient, Venue, User } from "@prisma/client"
import { CreateVenueRequestParams } from "../../zod/venue/create-venue-params-schema"
import { VenueRepositoryInterface } from "../interface/venue-repository-interface"



export class PrismaVenueRepository implements VenueRepositoryInterface {

    constructor (private readonly prisma: PrismaClient){}
  
    async create (params: CreateVenueRequestParams): Promise<Venue | null> {
      return await this.prisma.venue.create({
        data:{
        ...params
        },
      })
    }
  
   /*  async update (reference: UpdateVenueRequestParams): Promise<Venue  | null> {
      return await this.prisma.venue.update({
        where:{
          id: reference.venueId
        },
        data:{
          ...reference.data
        }
      })
    } */

    async getById (reference: string): Promise<Venue  | null> {
      return await this.prisma.venue.findFirst({
        where:{
          id: reference
        }
      })
    }

    async delete (reference: string): Promise<Venue | null> {
      return await this.prisma.venue.delete({
        where:{
            id: reference
        }
      })
    }

    async list (reference: string): Promise<Venue[] | null> {
      return await this.prisma.venue.findMany({
        
      })
    }
  }