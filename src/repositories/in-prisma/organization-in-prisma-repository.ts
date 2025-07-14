import { PrismaClient, Organization,  } from "@prisma/client"
import { DeleteOrganizationSchema } from "../../zod/organization/delete-organization-params-schema"
import { ListOrganizationQuerySchema } from "../../zod/organization/list-organization-params-schema"
import { GetByIdOrganizationSchema } from "../../zod/organization/get-by-id-organization-params-schema"
import { CreateOrganizationRequestParams } from "../../zod/organization/create-organization-params-schema"
import { OrganizationRepositoryInterface, OrganizationWebDataResponse, UpdateOrganizationRequestParams } from "../interface/organization-repository-interface"
import { UpdateImageOrganizationRequestSchema } from "../../zod/organization/update-image-organization-request-schema"
import { GetOrganziationWebDataRequestParamSchema } from "../../zod/organization/get-web-data-param-schema"

type OrganizationWithVenueCount = Organization & {
  _count: {
    venues: number
  }
}

export class PrismaOrganizationRepository implements OrganizationRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async  create({ userId, ...rest }: CreateOrganizationRequestParams): Promise<Organization | null> {
    const permissions: string = "EDIT_ORGANIZATION";

    return await this.prisma.organization.create({
      data: {
        ...rest,
        userOrganizations: {
          create: {
            userId: userId,
            userPermissions: {
              create: [
                {
                  role: "ADMIN",
                  venueId: null ,// Pode ser nulo ou você pode definir para um venue específico
                  permissions: permissions, // A permissão é agora uma string
                }
              ]
            }
          }
        }
      }
    });
  }
  
  async update(reference: UpdateOrganizationRequestParams): Promise<Organization | null> {
    return await this.prisma.organization.update({
      where: {
        id: reference.organizationId
      },
      data: {
        ...reference.data
      },
      include: {
        owners: true,
        venues: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      }
    })
  }

  async updateImages({ organizationId, imageids, venueId }: UpdateImageOrganizationRequestSchema): Promise<Organization | null> {
    // Buscar todas as imagens relacionadas ao venueId
    const venueImages = await this.prisma.image.findMany({
      where: {
        venueId: venueId
      },
      select: {
        id: true
      }
    });

    // Extrair os IDs das imagens do venue
    const venueImageIds = venueImages.map(img => img.id);

    // Atualizar imagens que estão na lista imageids para isShowOnOrganization = true
    if (imageids.length > 0) {
      await this.prisma.image.updateMany({
        where: {
          id: {
            in: imageids
          },
          venueId: venueId
        },
        data: {
          isShowOnOrganization: true
        }
      });
    }

    // Atualizar imagens que NÃO estão na lista imageids para isShowOnOrganization = false
    const imagesToHide = venueImageIds.filter(id => !imageids.includes(id));
    
    if (imagesToHide.length > 0) {
      await this.prisma.image.updateMany({
        where: {
          id: {
            in: imagesToHide
          },
          venueId: venueId
        },
        data: {
          isShowOnOrganization: false
        }
      });
    }

    // Retornar a organização atualizada
    return await this.prisma.organization.findFirst({
      where: {
        id: organizationId
      },
      include: {
        owners: true,
        venues: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      },
    });
  }

  async getOrganizationWebData({ organizationId }: GetOrganziationWebDataRequestParamSchema): Promise<OrganizationWebDataResponse | null> {
    return await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
      },
      select: {
        id: true,
        facebookUrl: true,
        instagramUrl: true,
        tiktokUrl: true,
        logoUrl: true,
        name: true,
        whatsappNumber: true,
        images: true,
        texts: true,
        email: true
      }
    });
  }

  async getById({ organizationId, venueName }: GetByIdOrganizationSchema): Promise<Organization | null> {
    return await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        ...(venueName && {
          venues: {
            some: {
              name: {
                contains: venueName,
              },
            },
          }
        }),
      },
      include: {
        owners: true,
        venues: {
          select: {
            id: true,
            name: true,
            images: true,
          },
          where: venueName
            ? {
              name: {
                contains: venueName,
              },
            }
            : undefined,
        },
      },
    })
  }

  async delete({ organizationId }: DeleteOrganizationSchema): Promise<Organization | null> {
    return await this.prisma.organization.delete({
      where: {
        id: organizationId
      }
    })
  }

  async list({ userId, name }: ListOrganizationQuerySchema): Promise<OrganizationWithVenueCount[] | null> {
    return await this.prisma.organization.findMany({
      where: {
        ...(userId && {
        userOrganizations: {
          some: {
              userId: userId
            }
          },
        }),
        ...(name && {
          name: {
            contains: name,
          },
        }),
      },
      include: {
        _count: {
          select: {
            venues: true
          }
        }
      }
    })
  }
}