import { PrismaClient, DateEvent, User } from "@prisma/client";
import { CreateDateEventDbSchema } from "../../zod/dataEvent/create-date-event-db-schema";
import { DateEventRepositoryInterface, ValidateDateParam } from "../interface/data-event-repository-interface";
import { ListDateEventRequestQuerySchema } from "../../zod/dataEvent/list-date-event-query-schema";
import { UpdateDateEventDbSchema } from "../../zod/dataEvent/update-date-event-db-schema";

export class PrismaDateEventRepository implements DateEventRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create(params: CreateDateEventDbSchema): Promise<DateEvent | null> {
    const { data, venueId, proposalId, userId, username } = params
    const newDateEvent = await this.prisma.dateEvent.create({
      data: {
        venue: {
          connect: {
            id: venueId
          }
        },
        ...(proposalId && {
          proposal: {
            connect: {
              id: proposalId
            }
          }
        })
        ,
        ...data
      }
    })

    if (data.type === "EVENT" || data.type === "PRODUCTION" || data.type === "BARTER" && proposalId) {
      await this.prisma.proposal.update({
        where: {
          id: proposalId
        },
        data: {
          approved: true
        }
      })
    }

    return newDateEvent
  }

  async checkAvailability({ endDate, startDate, venueId,dataeEventId }: ValidateDateParam): Promise<DateEvent | null> {
    return await this.prisma.dateEvent.findFirst({
      where: {
        venueId: venueId,
        endDate: { gte: startDate }, // Verifica se a data de fim é maior ou igual à data de início
        startDate: { lte: endDate },
        NOT: {
          id: dataeEventId, 
        }, 
      },
    });
  }

  async delete(reference: string): Promise<DateEvent | null> {
    const response = await this.prisma.dateEvent.delete({
      where: {
        id: reference
      }
    })
    return response
  }

  async getById(param: string): Promise<DateEvent | null> {
    return await this.prisma.dateEvent.findFirst({
      where: {
        id: param
      }
    })
  }

  async update({ data, dateEventId }: UpdateDateEventDbSchema): Promise<DateEvent | null> {
    return await this.prisma.dateEvent.update({
      where: {
        id: dateEventId
      },
      data: {
        ...data
      }
    })
  }

  async list({ venueId, proposalId }: ListDateEventRequestQuerySchema): Promise<DateEvent[] | null> {
    return await this.prisma.dateEvent.findMany({
      where: {
        ...(venueId && {
          venueId,
        }),
        ...(proposalId && {
          proposalId,
        }),
      },
      include:{
        proposal:{
          select:{
            guestNumber: true
          }
        }
      },
      orderBy:{
        startDate: "asc"
      }
    })
  }
}