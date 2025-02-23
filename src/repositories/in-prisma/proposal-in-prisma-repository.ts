import { PrismaClient, Proposal } from "@prisma/client"
import { ListProposalRequestQuerySchema } from "../../zod/proposal/list-proposal-query-schema";
import { UpdateProposalInDbParam } from "../../zod/proposal/update-proposal-in-db-params-schema";
import { CreateProposalInDbParams, ItemListProposalResponse, MonthProposalDataCount, ProposalRepositoryInterface, ProposalWithRelations, TrafegoCountResponse, TrafficSourceTypes, UpdateProposalServices } from "../interface/proposal-repository-interface"
import { GetTrafficCountVenueDbSchema } from "../../zod/venue/get-venue-traffic-count-db-schema";
import { GetVenueAnalysisByMonthDbSchema } from "../../zod/venue/get-venue-analysis-by-month-db-schema";
export class PrismaProposalRepository implements ProposalRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async createPerPerson(params: CreateProposalInDbParams): Promise<Proposal | null> {

    const { serviceIds, venueId, ...rest } = params

    const x = await this.prisma.proposal.create({
      data: {
        ...rest,
        venue: {
          connect: {
            id: venueId
          }
        },
        proposalServices: {
          createMany: {
            data: params.serviceIds?.map((serviceId: string) => ({
              serviceId: serviceId,
            })) || [],
          },
        },
      },
    });


    return x
  }

  async createPerDay(params: CreateProposalInDbParams): Promise<Proposal | null> {

    const { serviceIds, ...rest } = params

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

  async update(reference: UpdateProposalInDbParam): Promise<Proposal | null> {
    const { serviceIds, ...rest } = reference.data
    const currentServices = await this.prisma.proposal.findUnique({
      where: { id: reference.proposalId },
      include: {
        proposalServices: {
          select: { serviceId: true },
        },
      },
    });

    const services = reference.data.serviceIds
    const currentOwnerIds = currentServices?.proposalServices.map((relation) => relation.serviceId) || [];

    const ownersToConnect = services?.filter((id) => !currentOwnerIds.includes(id)) || [];
    const ownersToDisconnect = currentOwnerIds.filter((id) => !services?.includes(id)) || [];

    return await this.prisma.proposal.update({
      where: {
        id: reference.proposalId
      },
      data: {
        ...rest,
        proposalServices: {
          create: ownersToConnect.map((serviceId) => ({
            service: { connect: { id: serviceId } }, // Relaciona o owner
          })),
          deleteMany: ownersToDisconnect.map((serviceId) => ({
            serviceId,
            proposalId: reference.proposalId
          })),
        },
      }
    })
  }

  async updateServices({ serviceIds, proposalId }: UpdateProposalServices): Promise<Proposal | null> {
    const currentServices = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        proposalServices: {
          select: { serviceId: true },
        },
      },
    });

    const services = serviceIds
    const currentOwnerIds = currentServices?.proposalServices.map((relation) => relation.serviceId) || [];

    const ownersToConnect = services?.filter((id) => !currentOwnerIds.includes(id)) || [];
    const ownersToDisconnect = currentOwnerIds.filter((id) => !services?.includes(id)) || [];

    return await this.prisma.proposal.update({
      where: {
        id: proposalId
      },
      data: {
        proposalServices: {
          create: ownersToConnect.map((serviceId) => ({
            service: { connect: { id: serviceId } }, // Relaciona o owner
          })),
          deleteMany: ownersToDisconnect.map((serviceId) => ({
            serviceId,
            proposalId: proposalId
          })),
        },
      }
    })
  }

  async trafficCount({ year, venueId, approved }: GetTrafficCountVenueDbSchema): Promise<TrafegoCountResponse | null> {
    const trafegoCounts = await this.prisma.proposal.groupBy({
      by: ["trafficSource"],
      _count: {
        trafficSource: true,
      },
      where: {
        venueId,
        ...(approved && {
          approved: true,
        }),
        startDate: {
          gte: new Date(year ? year : new Date().getFullYear(),0,1),
          lt: new Date(year ? year : new Date().getFullYear(), 12, 31),
        },
      },
    });

    const proposalAccount = trafegoCounts.reduce(
      (acc, curr) => acc + curr._count.trafficSource,
      0
    );

    const trafficData = {
      all: proposalAccount,
      google:
        trafegoCounts.find((item) => item.trafficSource === "GOOGLE")?._count
          .trafficSource || 0,
      instagram:
        trafegoCounts.find((item) => item.trafficSource === "INSTAGRAM")?._count
          .trafficSource || 0,
      tikTok:
        trafegoCounts.find((item) => item.trafficSource === "TIKTOK")?._count
          .trafficSource || 0,
      facebook:
        trafegoCounts.find((item) => item.trafficSource === "FACEBOOK")?._count
          .trafficSource || 0,
      friend:
        trafegoCounts.find((item) => item.trafficSource === "FRIEND")?._count
          .trafficSource || 0,
      other:
        trafegoCounts.find((item) => item.trafficSource === "OTHER")?._count
          .trafficSource || 0,
      airbnb:
        trafegoCounts.find((item) => item.trafficSource === "AIRBNB")?._count
          .trafficSource || 0,
    };

    const trafegoList = Object.keys(trafficData)?.map((key) => ({
      name: key,
      count: trafficData[key as keyof TrafficSourceTypes],
    }));

    // Ordenando baseado no valor de 'todos'
    const sortedSources = trafegoList.sort(
      (a, b) => b.count / trafficData?.all - a.count / trafficData?.all
    );

    return { all: trafficData.all, sortedSources };
  }


  async getById(reference: string): Promise<ProposalWithRelations | null> {
    return await this.prisma.proposal.findFirst({
      where: {
        id: reference
      },
      include: {
        proposalServices: {
          include: {
            service: true
          }
        },
        histories: {
          orderBy: {
            createdAt: "asc"
          }
        },
        payments: {
          orderBy: {
            createdAt: "asc"
          }
        },
        personList: {
          orderBy: {
            name: "asc"
          }
        },
        scheduleList: {
          orderBy: {
            startHour: "asc"
          }
        }
      }
    })
  }

  async delete(reference: string): Promise<Proposal | null> {
    return await this.prisma.proposal.delete({
      where: {
        id: reference
      }
    })
  }

  async list({ venueId, email, name, month, year, approved }: ListProposalRequestQuerySchema): Promise<ItemListProposalResponse[] | null> {
    return await this.prisma.proposal.findMany({
      where: {
        venueId,
        ...(email && {
          email: {
            contains: email,
          },
        }),
        ...(name && {
          name: {
            contains: name,
          },
        }),
        approved: approved ? true : false,
        ...(month && {
          startDate: {
            gte: new Date(
              year ? Number(year) : new Date().getFullYear(),
              Number(month) - 1,
              1
            ), // Início do mês
            lt: new Date(year ? Number(year) : new Date().getFullYear(), Number(month), 1),
          },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        endDate: true,
        startDate: true,
        totalAmount: true,
      }
    })
  }

  async analysisByMonth({ year,venueId,approved }: GetVenueAnalysisByMonthDbSchema): Promise<any> {
    return await this.prisma.proposal.findMany({
      where: {
        venueId,
        ...(approved && {
          approved: true,
        }),
        startDate: {
          gte: new Date(year ? year : new Date().getFullYear(),0,1),
          lt: new Date(year ? year : new Date().getFullYear(), 12, 31),
        },
      },
      select: {
        totalAmount: true,
        startDate: true,
        trafficSource: true,
        guestNumber: true,
        approved: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });
  }
}

