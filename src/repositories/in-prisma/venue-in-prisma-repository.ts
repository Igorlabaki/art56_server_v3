import dayjs from "dayjs"

import { PrismaClient, Venue, User } from "@prisma/client"
import { CreateVenueRequestParams } from "../../zod/venue/create-venue-params-schema"
import { ItemListVenueResponse, VenueRepositoryInterface } from "../interface/venue-repository-interface"
import { ListVenueRequestQuerySchema, } from "../../zod/venue/list-venue-query-schema"
import { GetVenueByIdRequestParamSchema } from "../../zod/venue/get-by-id-venue-param-schema"
import { UpdateVenueSchema } from "../../zod/venue/update-venue-params-schema"
import { ListPermittedVenueRequestQuerySchema } from "../../zod/venue/list-venue-permitted-query-schema"
import { GetSelectedVenueRequestParamSchema } from "../../zod/venue/get-selected-venue-param-schema"



export class PrismaVenueRepository implements VenueRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create(params: CreateVenueRequestParams): Promise<Venue | null> {
    const { data, organizationId, userId } = params; // createdBy = ID do usuário que criou a venue
    const { owners, pricePerDay, pricePerPerson, maxGuest,pricePerPersonDay,pricePerPersonHour, ...rest } = data;

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
          "EDIT_EVENT", "EDIT_PROPOSAL", "EDIT_ORGANIZATION", "EDIT_VENUE",
          "VIEW_EVENTS", "VIEW_PROPOSALS", "VIEW_ANALYSIS", "VIEW_CALENDAR",
          "EDIT_ATTENDANCE_LIST", "EDIT_PROPOSALS", "EDIT_QUESTIONS", "EDIT_VENUES"
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
        contracts: true
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
        contracts: true
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
      }
    })
  }

  async listPermitted({ organizationId, name, userId }: ListPermittedVenueRequestQuerySchema): Promise<ItemListVenueResponse[] | null> {
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
      }
    });
  }
}