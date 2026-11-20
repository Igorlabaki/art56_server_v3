import { PrismaClient, Person } from "@prisma/client";
import { PersonRepositoryInterface } from "../interface/person-repository-interface";
import { CreatePersonRequestParams } from "../../zod/person/create-person-params-schema";
import { ListPersonRequestQuerySchema } from "../../zod/person/list-person-query-schema";
import { UpdatePersonRequestParams } from "../../zod/person/update-person-params-schema";
import { CreateManyPersonSchema } from "../../zod/person/create-many-person-params-schema";
import { resolveProposalId } from "../../functions/proposal-public-key";


export class PrismaPersonRepository implements PersonRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  private proposalIdFromKey(key: string): Promise<string | null> {
    return resolveProposalId(key, async (code) => {
      const proposal = await this.prisma.proposal.findUnique({
        where: { publicCode: code },
        select: { id: true },
      });
      return proposal?.id ?? null;
    });
  }
  
  async create({proposalId,username,userId,venueInfo,...rest}: CreatePersonRequestParams): Promise<Person | null> {
    const id = await this.proposalIdFromKey(proposalId);
    if (!id) return null;
    return await this.prisma.person.create({
      data: {
        proposal :{
          connect:{
            id
          }
        },
        ...rest
      },
    });
  }

  async createMany(personList: CreateManyPersonSchema): Promise<{list: Person[], count: number} > {
    const proposalId = await this.proposalIdFromKey(personList[0].proposalId);
    if (!proposalId) return { list: [], count: 0 };
    const { count } = await this.prisma.person.createMany({
      data: personList.map(person => ({
        ...person,
        proposalId,
      }))
    })

     const list = await this.prisma.person.findMany({
      where: {  
        type: personList[0].type,
        proposalId
      },
      orderBy: {
        name: "asc",
      },
    });

    return {count, list}
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
    const id = await this.proposalIdFromKey(proposalId);
    if (!id) return [];
    return await this.prisma.person.findMany({
      where: {
        ...(name && {
          name: {
            contains: name
          }
        }),
        type,
        proposalId: id
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}
