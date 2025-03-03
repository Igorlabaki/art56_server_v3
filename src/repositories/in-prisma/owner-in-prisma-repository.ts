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
    const { organizationId,venueId, ...rest } = params
    return await this.prisma.owner.create({
      data: {
        organization: {
          connect: {
            id: organizationId
          }
        },
        ownerVenue:{
          create:{
            venueId
          }
        },
        ...rest
      },
    })
  }

  async update(reference: UpdateOwnerSchema): Promise<Owner | null> {
    return await this.prisma.owner.update({
      where: {
        id: reference.ownerId
      },
      data: {
        ...reference.data
      }
    })
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
      orderBy:{
        completeName: "asc"
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
      orderBy:{
        owner:{
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
      orderBy:{
        completeName: "asc"
      }
    });
  }
}