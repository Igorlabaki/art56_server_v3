import { Prisma, PrismaClient, Contact, PartnerCategory } from "@prisma/client";
import { ContactListDbQuery, ContactListSummary, ContactRepositoryInterface } from "../interface/contact-repository-interface";
import { CreateContactRequestParams } from "../../zod/contact/create-contact-params-schema";
import { UpdateContactRequestParams } from "../../zod/contact/update-contact-params-schema";

function asPartnerCategory(category: string | null): PartnerCategory | null {
  return category as PartnerCategory;
}

export class PrismaContactRepository implements ContactRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async create(params: CreateContactRequestParams): Promise<Contact | null> {
    const { venueId, category, ...rest } = params
    return await this.prisma.contact.create({
      data: {
        venue:{
          connect:{
            id: venueId
          }
        },
        ...rest,
        ...(category !== undefined ? { category: asPartnerCategory(category) } : {}),
      },
    });
  }

  async delete(reference: string): Promise<Contact | null> {
    return await this.prisma.contact.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<Contact | null> {
    return await this.prisma.contact.findFirst({
      where: {
        id: reference,
      },
    });
  }

  async update({ data, contactId }: UpdateContactRequestParams): Promise<Contact | null> {
    const { category, ...rest } = data
    return await this.prisma.contact.update({
      where: {
        id: contactId,
      },
      data: {
        ...rest,
        ...(category !== undefined ? { category: asPartnerCategory(category) } : {}),
      },
    });
  }

  async list(query: ContactListDbQuery): Promise<{ items: Contact[]; total: number }> {
    const where = contactListWhere(query);
    const orderBy = [{ name: "asc" as const }, { id: "asc" as const }];

    if (query.take === undefined) {
      const items = await this.prisma.contact.findMany({ where, orderBy });
      return { items, total: items.length };
    }

    const [total, items] = await Promise.all([
      this.prisma.contact.count({ where }),
      this.prisma.contact.findMany({
        where,
        orderBy,
        skip: query.skip ?? 0,
        take: query.take,
      }),
    ]);

    return { items, total };
  }

  async summarize(query: ContactListDbQuery): Promise<ContactListSummary> {
    const rows = await this.prisma.$queryRaw<Array<{ total: bigint; withLogo: bigint; withDescription: bigint }>>(Prisma.sql`
      SELECT COUNT(*) AS total,
             COALESCE(SUM(CASE WHEN \`logoUrl\` IS NOT NULL AND CHAR_LENGTH(TRIM(\`logoUrl\`)) > 0 THEN 1 ELSE 0 END), 0) AS withLogo,
             COALESCE(SUM(CASE WHEN \`description\` IS NOT NULL AND CHAR_LENGTH(TRIM(\`description\`)) > 0 THEN 1 ELSE 0 END), 0) AS withDescription
      FROM \`contact\`
      WHERE ${Prisma.join(contactListSqlFilters(query), " AND ")}
    `);
    const row = rows[0];
    return {
      total: Number(row?.total ?? 0),
      withLogo: Number(row?.withLogo ?? 0),
      withDescription: Number(row?.withDescription ?? 0),
    };
  }
}

function contactListWhere(query: ContactListDbQuery): Prisma.ContactWhereInput {
  return {
    venueId: query.venueId,
    ...(query.name ? { name: { contains: query.name } } : {}),
    ...(query.type ? { type: query.type } : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(query.q ? {
      OR: [
        { name: { contains: query.q } },
        { role: { contains: query.q } },
        { whatsapp: { contains: query.q } },
        { email: { contains: query.q } },
      ],
    } : {}),
  };
}

function containsLike(value: string): string {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

function contactListSqlFilters(query: ContactListDbQuery): Prisma.Sql[] {
  const filters: Prisma.Sql[] = [Prisma.sql`venueId = ${query.venueId}`];
  if (query.name) filters.push(Prisma.sql`name LIKE ${containsLike(query.name)}`);
  if (query.type) filters.push(Prisma.sql`type = ${query.type}`);
  if (query.category) filters.push(Prisma.sql`category = ${query.category}`);
  if (query.q) {
    const like = containsLike(query.q);
    filters.push(Prisma.sql`(name LIKE ${like} OR IFNULL(role, '') LIKE ${like} OR whatsapp LIKE ${like} OR IFNULL(email, '') LIKE ${like})`);
  }
  return filters;
}
