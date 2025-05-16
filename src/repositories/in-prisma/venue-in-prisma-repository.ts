import dayjs from "dayjs"

import { PrismaClient, Venue, User } from "@prisma/client"
import { CreateVenueRequestParams } from "../../zod/venue/create-venue-params-schema"
import { ItemListVenueResponse, VenueAnalyticsResponse, VenueRepositoryInterface } from "../interface/venue-repository-interface"
import { ListVenueRequestQuerySchema, } from "../../zod/venue/list-venue-query-schema"
import { GetVenueByIdRequestParamSchema } from "../../zod/venue/get-by-id-venue-param-schema"
import { UpdateVenueSchema } from "../../zod/venue/update-venue-params-schema"
import { ListPermittedVenueRequestQuerySchema } from "../../zod/venue/list-venue-permitted-query-schema"
import { GetSelectedVenueRequestParamSchema } from "../../zod/venue/get-selected-venue-param-schema"
import { GetVenueAnalyticsParams } from "../../zod/venue/get-venue-analytics-params-schema"



export class PrismaVenueRepository implements VenueRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create(params: CreateVenueRequestParams): Promise<Venue | null> {
    const { data, organizationId, userId } = params; // createdBy = ID do usuário que criou a venue
    const { owners, pricePerDay, pricePerPerson, maxGuest, pricePerPersonDay, pricePerPersonHour, ...rest } = data;

    // Formatando os valores de preço e maxGuest
    const perPerson = Number(pricePerPerson?.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
    const perDay = Number(pricePerDay?.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
    const perPersonDay = Number(pricePerPersonDay?.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
    const perPersonHour = Number(pricePerPersonHour?.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
    const maxGuestFormated = Number(maxGuest);

    return await this.prisma.$transaction(async (prisma) => {
      // Criar a Venue
      const newVenue = await prisma.venue.create({
        data: {
          ...rest,
          ownerVenue: {
            create: owners.map((ownerId: string) => ({
              ownerId: ownerId, // Para cada ID, cria a relação
            })),
          },
          organization: {
            connect: {
              id: organizationId,
            },
          },
          pricePerDay: perDay,
          pricePerPerson: perPerson,
          maxGuest: maxGuestFormated,
          pricePerPersonDay: perPersonDay,
          pricePerPersonHour: perPersonHour,
        },
      });

      // Buscar o UserOrganization do usuário que criou a Venue
      const userOrganization = await prisma.userOrganization.findFirst({
        where: { userId, organizationId },
      });

      if (userOrganization) {
        // Lista de permissões padrão
        const permissionsData = [
          "EDIT_CALENDAR", "EDIT_INFO", "EDIT_IMAGE", "EDIT_EVENTS",
          "EDIT_CALENDARS", "EDIT_INFOS", "EDIT_IMAGES", "EDIT_TEXTS",
          "EDIT_EXPENSES", "EDIT_SERVICES", "EDIT_PAYMENTS", "EDIT_DATES",
          "VIEW_NOTIFICATIONS", "VIEW_INFO", "VIEW_IMAGES", "VIEW_AMOUNTS",
          "EDIT_EVENT", "EDIT_PROPOSAL", "EDIT_ORGANIZATION", "EDIT_VENUE", "EDIT_SCHEDULE",
          "VIEW_EVENTS", "VIEW_PROPOSALS", "VIEW_ANALYSIS", "VIEW_CALENDAR", "EDIT_DOCUMENTS",
          "EDIT_ATTENDANCE_LIST", "EDIT_PROPOSALS", "EDIT_QUESTIONS", "EDIT_VENUES", "SEND_CLIENT"
        ]

        // Concatenando as permissões em uma única string
        const permissionsString = permissionsData.join(',');

        // Criar uma única permissão para o usuário admin, com todas as permissões concatenadas
        await prisma.userPermission.create({
          data: {
            role: "ADMIN",
            userOrganizationId: userOrganization.id,
            venueId: newVenue.id,
            permissions: permissionsString, // Agora armazenando todas as permissões em uma única string
          },
        });
      }

      return newVenue;
    });
  }

  async update(reference: UpdateVenueSchema): Promise<Venue | null> {
    const { pricePerDay, pricePerPerson, pricePerPersonDay, pricePerPersonHour, owners, maxGuest, ...rest } = reference.data;

    const currentVenue = await this.prisma.venue.findUnique({
      where: { id: reference.venueId },
      include: {
        ownerVenue: {
          select: { ownerId: true },
        },
      },
    });

    const currentOwnerIds = currentVenue?.ownerVenue.map((relation) => relation.ownerId) || [];

    const ownersToConnect = owners?.filter((id) => !currentOwnerIds.includes(id)) || [];
    const ownersToDisconnect = currentOwnerIds.filter((id) => !owners?.includes(id)) || [];

    const perPerson = Number(pricePerPerson?.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
    const perDay = Number(pricePerDay?.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
    const perPersonDay = Number(pricePerPersonDay?.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
    const perPersonHour = Number(pricePerPersonHour?.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;

    return await this.prisma.venue.update({
      where: {
        id: reference.venueId,
      },
      data: {
        ...rest,
        maxGuest: Number(maxGuest),
        pricePerDay: perDay,
        pricePerPerson: perPerson,
        pricePerPersonDay: perPersonDay,
        pricePerPersonHour: perPersonHour,
        ownerVenue: {
          create: ownersToConnect.map((ownerId) => ({
            owner: { connect: { id: ownerId } }, // Relaciona o owner
          })),
          deleteMany: ownersToDisconnect.map((ownerId) => ({
            ownerId,
            venueId: reference.venueId,
          })),
        },
      },
      include: {
        UserPermission: {
          where: { userOrganization: { userId: reference.userId } }, // 🔥 Filtra novamente ao incluir para trazer apenas as permissões do usuário
          select: {
            permissions: true,
          }
        },
        ownerVenue: {
          include: {
            owner: true
          }
        }
      }
    });
  }

  async getById({ venueId }: GetVenueByIdRequestParamSchema): Promise<Venue | null> {
    return await this.prisma.venue.findFirst({
      where: {
        id: venueId,
      },
      include: {
        ownerVenue: {
          include: {
            owner: true
          }
        },
        UserPermission: {
          select: {
            permissions: true
          }
        },
        seasonalFee: true,
        contracts: true,
        attachments: true,
        Payment: true
      }
    });
  }

  async getSelectedVenue({ venueId, userId }: GetSelectedVenueRequestParamSchema): Promise<Venue | null> {
    return await this.prisma.venue.findFirst({
      where: {
        id: venueId,
        UserPermission: {
          some: { userOrganization: { userId: userId } } // 🔥 Filtra permissões apenas do usuário
        }
      },
      include: {
        UserPermission: {
          where: { userOrganization: { userId: userId } }, // 🔥 Filtra novamente ao incluir para trazer apenas as permissões do usuário
          select: {
            permissions: true,
          }
        },
        ownerVenue: {
          include: {
            owner: true
          }
        },
        contracts: true,
        attachments: true
      }
    });
  }


  async delete(reference: string): Promise<Venue | null> {
    return await this.prisma.venue.delete({
      where: {
        id: reference
      }
    })
  }

  async list({ organizationId, name }: ListVenueRequestQuerySchema): Promise<ItemListVenueResponse[] | null> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return await this.prisma.venue.findMany({
      where: {
        organizationId,
        ...(name && {
          name
        }),
      },
      select: {
        id: true,
        name: true,
        images: {
          select: {
            imageUrl: true
          }
        },
        // Próximo evento (qualquer data futura)
        DateEvent: {
          where: {
            startDate: {
              gte: today // Apenas eventos futuros
            }
          },
          orderBy: {
            startDate: 'asc' // Ordena do mais próximo para o mais distante
          },
          take: 1, // Pega apenas o primeiro (mais próximo)
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            type: true
          }
        },
        // Contagem de eventos do mês atual
        _count: {
          select: {
            DateEvent: {
              where: {
                startDate: {
                  gte: firstDayOfMonth,
                  lte: lastDayOfMonth
                }
              }
            }
          }
        }
      }
    });
  }

  async listPermitted({ organizationId, name, userId }: ListPermittedVenueRequestQuerySchema): Promise<ItemListVenueResponse[] | null> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);


    return await this.prisma.venue.findMany({
      where: {
        organizationId,
        ...(name && { name }),
        UserPermission: {
          some: {
            userOrganization: {
              userId: userId
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        images: {
          select: {
            imageUrl: true
          }
        },
        // Próximo evento (qualquer data futura)
        DateEvent: {
          where: {
            startDate: {
              gte: today // Apenas eventos futuros
            }
          },
          orderBy: {
            startDate: 'asc' // Ordena do mais próximo para o mais distante
          },
          take: 1, // Pega apenas o primeiro (mais próximo)
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            type: true
          }
        },
        // Contagem de eventos do mês atual
        _count: {
          select: {
            DateEvent: {
              where: {
                startDate: {
                  gte: firstDayOfMonth,
                  lte: lastDayOfMonth
                }
              }
            }
          }
        }
      }
    });
  }

  async getVenueAnalytics({ venueId, params }: GetVenueAnalyticsParams): Promise<VenueAnalyticsResponse | null> {
    const today = new Date();
    
    // Define o ano (se não for fornecido, usa o atual)
    const selectedYear = params?.year ? parseInt(params.year) : today.getFullYear();
    
    // Define o mês (se não for fornecido, usa o atual)
    const selectedMonth = params?.month === 'all' ? 0 : (params?.month ? parseInt(params.month) - 1 : today.getMonth()); // -1 porque os meses em JS começam em 0
    
    const firstDayOfYear = new Date(selectedYear, 0, 1);
    const lastDayOfYear = new Date(selectedYear, 11, 31);
    
    // Se month for 'all', usamos o ano inteiro
    const firstDayOfMonth = params?.month === 'all' ? firstDayOfYear : new Date(selectedYear, selectedMonth, 1);
    const lastDayOfMonth = params?.month === 'all' ? lastDayOfYear : new Date(selectedYear, selectedMonth + 1, 0);
    
    // Se month for 'all', usamos o ano anterior
    const firstDayOfLastMonth = params?.month === 'all' ? new Date(selectedYear - 1, 0, 1) : new Date(selectedYear, selectedMonth - 1, 1);
    const lastDayOfLastMonth = params?.month === 'all' ? new Date(selectedYear - 1, 11, 31) : new Date(selectedYear, selectedMonth, 0);

    // Busca o venue com contagens e próximos eventos
    const venue = await this.prisma.venue.findUnique({
      where: { id: venueId },
      select: {
        DateEvent: {
          where: {
            OR: [
              // Eventos do ano para contagem total
              {
                startDate: {
                  gte: firstDayOfYear,
                  lte: lastDayOfYear
                },
                type: 'EVENT'
              },
              // Eventos do período selecionado
              {
                startDate: {
                  gte: firstDayOfMonth,
                  lte: lastDayOfMonth
                }
              },
              // Eventos do período anterior
              {
                startDate: {
                  gte: firstDayOfLastMonth,
                  lte: lastDayOfLastMonth
                }
              },
              // Próximos eventos e visitas (sempre em relação à data atual)
              {
                startDate: {
                  gt: today
                }
              }
            ]
          },
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            type: true,
            proposal: {
              select: {
                id: true,
                totalAmount: true,
                createdAt: true
              }
            }
          },
          orderBy: {
            startDate: 'asc'
          }
        },
        proposals: {
          where: {
            createdAt: {
              gte: firstDayOfLastMonth,
              lte: lastDayOfMonth
            }
          },
          select: {
            totalAmount: true,
            createdAt: true
          }
        }
      }
    });

    if (!venue) return null;

    // Próximo evento (type: EVENT)
    const nextEvent = venue.DateEvent.find(event => 
      event.startDate > today && 
      event.type === 'EVENT'
    );

    // Próxima visita (type: VISIT)
    const nextVisit = venue.DateEvent.find(event => 
      event.startDate > today && 
      event.type === 'VISIT'
    );

    // Eventos do período selecionado
    const eventsThisMonth = venue.DateEvent.filter(event => 
      event.startDate >= firstDayOfMonth && 
      event.startDate <= lastDayOfMonth &&
      event.type === 'EVENT'
    ).length;

    // Total de eventos no ano
    const totalEventsInYear = venue.DateEvent.filter(event => 
      event.startDate >= firstDayOfYear && 
      event.startDate <= lastDayOfYear &&
      event.type === 'EVENT'
    ).length;

    // Propostas do período selecionado
    const proposalsThisMonth = venue.proposals.filter(proposal => 
      proposal.createdAt >= firstDayOfMonth && 
      proposal.createdAt <= lastDayOfMonth
    ).length;

    // Propostas do período anterior
    const proposalsLastMonth = venue.proposals.filter(proposal => 
      proposal.createdAt >= firstDayOfLastMonth && 
      proposal.createdAt <= lastDayOfLastMonth
    ).length;

    // Cálculo da variação de propostas
    const proposalsVariation = {
      value: proposalsLastMonth === 0 ? 100 : ((proposalsThisMonth - proposalsLastMonth) / proposalsLastMonth) * 100,
      isPositive: proposalsThisMonth >= proposalsLastMonth
    };

    // Visitas do período selecionado
    const visitsThisMonth = venue.DateEvent.filter(event => 
      event.type === 'VISIT' && 
      event.startDate >= firstDayOfMonth && 
      event.startDate <= lastDayOfMonth
    ).length;

    // Visitas do período anterior
    const visitsLastMonth = venue.DateEvent.filter(event => 
      event.type === 'VISIT' && 
      event.startDate >= firstDayOfLastMonth && 
      event.startDate <= lastDayOfLastMonth
    ).length;

    // Cálculo da variação de visitas
    const visitsVariation = {
      value: visitsLastMonth === 0 ? 100 : ((visitsThisMonth - visitsLastMonth) / visitsLastMonth) * 100,
      isPositive: visitsThisMonth >= visitsLastMonth
    };

    // Receita do período selecionado
    const monthlyRevenue = venue.DateEvent
      .filter(event => 
        event.startDate >= firstDayOfMonth && 
        event.startDate <= lastDayOfMonth && 
        event.proposal?.totalAmount
      )
      .reduce((total: number, event) => total + event.proposal!.totalAmount, 0);

    // Receita do período anterior
    const lastMonthRevenue = venue.DateEvent
      .filter(event => 
        event.startDate >= firstDayOfLastMonth && 
        event.startDate <= lastDayOfLastMonth && 
        event.proposal?.totalAmount
      )
      .reduce((total: number, event) => total + event.proposal!.totalAmount, 0);

    // Cálculo da variação de receita
    const revenueVariation = {
      value: lastMonthRevenue === 0 ? 100 : ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
      isPositive: monthlyRevenue >= lastMonthRevenue
    };

    return {
      totalEventsInYear,
      eventsThisMonth,
      proposalsInMonth: proposalsThisMonth,
      proposalsVariation,
      totalVisits: visitsThisMonth,
      visitsVariation,
      monthlyRevenue,
      revenueVariation,
      nextEvent: nextEvent ? {
        id: nextEvent.id,
        title: nextEvent.title,
        startDate: nextEvent.startDate,
        endDate: nextEvent.endDate,
        type: nextEvent.type,
        proposalId: nextEvent.proposal?.id || null
      } : null,
      nextVisit: nextVisit ? {
        id: nextVisit.id,
        title: nextVisit.title,
        startDate: nextVisit.startDate,
        endDate: nextVisit.endDate,
        type: nextVisit.type,
        proposalId: nextVisit.proposal?.id || null
      } : null
    };
  }
}