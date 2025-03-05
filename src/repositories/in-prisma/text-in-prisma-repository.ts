import { PrismaClient, Text } from "@prisma/client";
import { CreateTextRequestParams } from "../../zod/text/create-text-params-schema";
import { ListTextRequestQuerySchema } from "../../zod/text/list-text-query-schema";
import { UpdateTextRequestParams } from "../../zod/text/update-text-params-schema";
import { TextRepositoryInterface, ValidateTextAreaPositionParams, ValidateTextAreaTitleParams } from "../interface/text-repository-interface";

export class PrismaTextRepository implements TextRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async create(params: CreateTextRequestParams): Promise<Text | null> {
    return await this.prisma.text.create({
      data: {
        ...params,
      },
    });
  }

  async delete(reference: string): Promise<Text | null> {
    return await this.prisma.text.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<Text | null> {
    return await this.prisma.text.findFirst({
      where: {
        id: reference,
      },
    });
  }

  async getByArea(reference: string): Promise<Text[] | null> {
    return await this.prisma.text.findMany({
      where: {
        area: reference,
      },
      orderBy: {
        position: "asc",
      },
    });
  }

  async validateIfExistTextAreaTitle(data: ValidateTextAreaTitleParams): Promise<Text | null> {
    return await this.prisma.text.findFirst({
      where: {
        AND: [
          {
            area: data.area,
          },
          { title: data.title },
          { venueId: data.venueId },
        ],
        NOT: [
          { id: data.textId }
        ]
      },
    });
  }

  async validateIfExistTextAreaPosition(data: ValidateTextAreaPositionParams): Promise<Text | null> {
    return await this.prisma.text.findFirst({
      where: {
        AND: [
          { area: data.area },
          { position: data.position },
          { venueId: data.venueId }
        ],
        NOT: [
          { id: data.textId }
        ]
      },
    });
  }

  async update({ data, textId }: UpdateTextRequestParams): Promise<Text | null> {
    return await this.prisma.text.update({
      where: {
        id: textId,
      },
      data: {
        ...data,
      },
    });
  }

  async list({ venueId, area }: ListTextRequestQuerySchema): Promise<Text[]> {
    return await this.prisma.text.findMany({
      where: {
        ...(area && {
          area: {
            contains: area
          }
        }),
        venueId
      },
      orderBy: {
        position: "asc",
      },
    });
  }
}
