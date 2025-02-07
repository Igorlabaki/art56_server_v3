import { PrismaClient, Person } from "@prisma/client";
import { PersonRepositoryInterface } from "../interface/person-repository-interface";
import { CreatePersonRequestParams } from "../../zod/person/create-person-params-schema";
import { ListPersonRequestQuerySchema } from "../../zod/person/list-person-query-schema";
import { UpdatePersonRequestParams } from "../../zod/person/update-person-params-schema";


export class PrismaPersonRepository implements PersonRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }
  
  async create({proposalId,username,userId,...rest}: CreatePersonRequestParams): Promise<Person | null> {
    return await this.prisma.person.create({
      data: {
        proposal :{
          connect:{
            id: proposalId
          }
        },
        ...rest
      },
    });
  }

  async delete(reference: string): Promise<Person | null> {
    return await this.prisma.person.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<Person | null> {
    return await this.prisma.person.findFirst({
      where: {
        id: reference,
      },
    });
  }

  async update({ data, personId }: UpdatePersonRequestParams): Promise<Person | null> {
    return await this.prisma.person.update({
      where: {
        id: personId,
      },
      data: {
        attendance: data.attendance,
        ...data
      },
    });
  }

  async list({ proposalId, name,type }: ListPersonRequestQuerySchema): Promise<Person[]> {
    return await this.prisma.person.findMany({
      where: {
        ...(name && {
          name: {
            contains: name
          }
        }),
        type,
        proposalId
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}
