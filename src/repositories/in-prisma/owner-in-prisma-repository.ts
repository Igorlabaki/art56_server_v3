import { PrismaClient, Owner, User } from "@prisma/client"
import { UpdateOwnerSchema } from "../../zod/owner/update-owner-params-schema"
import { ListOwnerQuerySchema } from "../../zod/owner/list-owner-params-schema"
import { OwnerRepositoryInterface } from "../interface/owner-repository-interface"
import { CreateOrganizationOwnerRequestParams } from "../../zod/owner/create-owner-params-schema"
import { ListOwnerByVenueIdQuerySchema } from "../../zod/owner/list-owners-by-venue-params-schema"
import { CreateVenueRequestParams } from "../../zod/venue/create-venue-params-schema"
import { CreateVenueOwnerRequestParams } from "../../zod/owner/create-venue-owner-params-schema"
export class PrismaOwnerRepository implements OwnerRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async createOrganizationOwner(params: CreateOrganizationOwnerRequestParams): Promise<Owner | null> {
    const { organizationId, ...rest } = params
    return await this.prisma.owner.create({
      data: {
        organization: {
          connect: {
            id: organizationId
          }
        },
        ...rest
      },
    })
  }

  async createVenueOwner(params: CreateVenueOwnerRequestParams): Promise<Owner | null> {
    const { organizationId, venueId, ...rest } = params
    return await this.prisma.owner.create({
      data: {
        organization: {
          connect: {
            id: organizationId
          }
        },
        ownerVenue: {
          create: {
            venueId
          }
        },
        ...rest
      },
    })
  }

  async update(reference: UpdateOwnerSchema): Promise<Owner | null> {
    const { ownerId, data: { venueIds, ...rest } } = reference;

    // Caso venueIds seja passado e seja um array vazio, removemos todos os vínculos primeiro
    if (venueIds && venueIds.length === 0) {
      await this.prisma.ownerVenue.deleteMany({
        where: { ownerId }
      });

      // Depois atualizamos os campos do Owner
      return await this.prisma.owner.update({
        where: { id: ownerId },
        data: { ...rest }
      });
    }

    // Caso venueIds seja passado com valores, atualizamos os vínculos
    if (venueIds) {
      // Busca vínculos atuais
      const existingVenues = await this.prisma.ownerVenue.findMany({
        where: { ownerId },
        select: { venueId: true },
      });

      const existingVenueIds = existingVenues.map(v => v.venueId);

      // Calcula os vínculos que precisam ser adicionados e removidos
      const toConnect = venueIds.filter(id => !existingVenueIds.includes(id));
      const toDisconnect = existingVenueIds.filter(id => !venueIds.includes(id));

      // Atualiza Owner com os vínculos ajustados
      return await this.prisma.owner.update({
        where: { id: ownerId },
        data: {
          ...rest,
          ownerVenue: {
            // Conecta apenas os novos
            ...(toConnect.length > 0 && {
              connect: toConnect.map(venueId => ({
                ownerId_venueId: { ownerId, venueId },
              })),
            }),
            // Desconecta apenas os removidos
            ...(toDisconnect.length > 0 && {
              disconnect: toDisconnect.map(venueId => ({
                ownerId_venueId: { ownerId, venueId },
              })),
            }),
          },
        },
      });
    }

    // Caso venueIds não seja enviado, atualiza apenas os dados do Owner
    return await this.prisma.owner.update({
      where: { id: ownerId },
      data: { ...rest }
    });
  }

  async getById(reference: string): Promise<Owner | null> {
    return await this.prisma.owner.findFirst({
      where: {
        id: reference
      }
    })
  }

  async vefiryIfOwnerExists(reference: string): Promise<Owner | null> {
    return await this.prisma.owner.findFirst({
      where: {
        completeName: reference
      }
    })
  }

  async delete(reference: string): Promise<Owner | null> {
    return await this.prisma.owner.delete({
      where: {
        id: reference
      }
    })
  }

  async list({ organizationId, completeName }: ListOwnerQuerySchema): Promise<Owner[] | null> {
    return await this.prisma.owner.findMany({
      where: {
        organizationId,
        ...(completeName && {
          completeName: {
            contains: completeName
          }
        })
      },
      orderBy: {
        completeName: "asc"
      },
      include: {
        ownerVenue: {
          include: {
            venue: {
              select: {
                name: true,
                id: true,
              }
            }
          }
        }
      }
    })
  }

  async listByVenue({ organizationId, venueId, completeName }: ListOwnerByVenueIdQuerySchema): Promise<Owner[] | null> {
    const ownersVenues = await this.prisma.ownerVenue.findMany({
      where: {
        venueId,
        venue: {
          organizationId,
        },
        owner: {
          completeName
        }
      },
      orderBy: {
        owner: {
          completeName: "asc"
        }
      }
    })

    // Extrai os IDs dos owners
    const ownerIds = ownersVenues.map((ov) => ov.ownerId);

    // Busca os owners correspondentes aos IDs filtrados
    return await this.prisma.owner.findMany({
      where: {
        id: {
          in: ownerIds, // Filtra pelos IDs obtidos anteriormente
        },
      },
      orderBy: {
        completeName: "asc"
      }
    });
  }
}