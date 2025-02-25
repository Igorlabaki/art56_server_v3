import { PrismaClient, Image } from "@prisma/client";
import { ImageRepositoryInterface } from "../interface/image-repository-interface";
import { CreateImageRequestParams } from "../../zod/image/create-image-params-schema";
import { ListImageRequestQuerySchema } from "../../zod/image/list-image-query-schema";
import { UpdateImageRequestParams } from "../../zod/image/upload-image-params-schema";
/* import { ListImageRequestQuerySchema } from "../../zod/image/list-image-query-schema";
import { UpdateImageRequestParams } from "../../zod/image/update-image-params-schema"; */

export class PrismaImageRepository implements ImageRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async create(params: CreateImageRequestParams): Promise<Image | null> {
    const { position, venueId, ...rest } = params
    return await this.prisma.image.create({
      data: {
        venue: {
          connect: {
            id: venueId
          }
        },
        position: Number(position),
        ...rest,
      },
    });
  }

  async delete(reference: string): Promise<Image | null> {
    return await this.prisma.image.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<Image | null> {
    return await this.prisma.image.findFirst({
      where: {
        id: reference,
      },
    });
  }

  async verifyImage({ imageId, position, tag }: { position: number, tag: string, imageId: string | null }): Promise<Image | null> {
    return await this.prisma.image.findFirst({
      where: {
        tag: tag,
        ...(imageId && {
          id: {
            not: imageId,
          }
        }),
        position: position,
      },
    });
  }

  async update({ imageId, position, ...rest }: UpdateImageRequestParams): Promise<Image | null> {
    return await this.prisma.image.update({
      where: {
        id: imageId,
      },
      data: {
        ...rest,
        position: Number(position),
      },
    });
  }

  async list({ venueId, description }: ListImageRequestQuerySchema): Promise<Image[]> {
    return await this.prisma.image.findMany({
      where: {
        ...(description && {
          description: {
            contains: description
          }
        }),
        venueId
      },
    });
  }
}
