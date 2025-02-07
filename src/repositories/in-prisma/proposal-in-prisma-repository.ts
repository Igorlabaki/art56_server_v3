import { PrismaClient, Proposal } from "@prisma/client"
import { ListProposalRequestQuerySchema } from "../../zod/proposal/list-proposal-query-schema";
import { UpdateProposalInDbParam } from "../../zod/proposal/update-proposal-in-db-params-schema";
import { CreateProposalInDbParams, ItemListProposalResponse, ProposalRepositoryInterface, ProposalWithRelations, UpdateProposalServices } from "../interface/proposal-repository-interface"

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

  async updateServices({serviceIds,proposalId}: UpdateProposalServices): Promise<Proposal | null>{
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
}