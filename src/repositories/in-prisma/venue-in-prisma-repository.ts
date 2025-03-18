import dayjs from "dayjs"

import { PrismaClient, Venue, User } from "@prisma/client"
import { CreateVenueRequestParams } from "../../zod/venue/create-venue-params-schema"
import { ItemListVenueResponse, VenueRepositoryInterface } from "../interface/venue-repository-interface"
import { ListVenueRequestQuerySchema } from "../../zod/venue/list-venue-query-schema"
import { GetVenueByIdRequestParamSchema } from "../../zod/venue/get-by-id-venue-param-schema"
import { UpdateVenueSchema } from "../../zod/venue/update-venue-params-schema"



export class PrismaVenueRepository implements VenueRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create(params: CreateVenueRequestParams): Promise<Venue | null> {
    const { data, organizationId, userId } = params; // createdBy = ID do usuário que criou a venue
    const { owners, pricePerDay, pricePerPerson, maxGuest, ...rest } = data;
    const perPerson = Number(pricePerPerson?.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
    const perDay = Number(pricePerDay?.replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
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
        },
      });
  
      // Buscar o UserOrganization do usuário que criou a Venue
      const userOrganization = await prisma.userOrganization.findFirst({
        where: { userId, organizationId },
      });
  
      if (userOrganization) {
        // Lista de permissões padrão
        const permissionsData = [
          "VIEW_INFO",
          "VIEW_EVENTS",
          "VIEW_IMAGES",
          "VIEW_CALENDAR",
          "VIEW_ANALYSIS",
          "VIEW_PROPOSALS",
          "VIEW_NOTIFICATIONS",
          "EDIT_INFO",
          "EDIT_IMAGE",
          "EDIT_VENUE",
          "EDIT_EVENT",
          "EDIT_PROPOSAL",
          "EDIT_CALENDAR",
        ];
  
        // Criar permissões apenas para o usuário que criou a Venue
        await prisma.userPermission.createMany({
          data: permissionsData.map((permissionName) => ({
            userOrganizationId: userOrganization.id,
            venueId: newVenue.id,
            permission: permissionName,
          })),
        });
      }
  
      return newVenue;
    });
  }

  async update(reference: UpdateVenueSchema): Promise<Venue | null> {
    const { pricePerDay, pricePerPerson, owners, maxGuest, ...rest } = reference.data;

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

    return await this.prisma.venue.update({
      where: {
        id: reference.venueId,
      },
      data: {
        ...rest,
        maxGuest: Number(maxGuest),
        pricePerDay: Number(pricePerDay),
        pricePerPerson: Number(pricePerPerson),
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
    });
  }

  async getById({ venueId }: GetVenueByIdRequestParamSchema): Promise<Venue | null> {
    return await this.prisma.venue.findFirst({
      where: {
        id: venueId
      },
      include: {
        ownerVenue: {
          include:{
            owner: true
          }
        },
      }
    })
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
}