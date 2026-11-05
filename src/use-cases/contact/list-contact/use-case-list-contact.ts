import { Contact } from "@prisma/client";
import { ContactListDbQuery, ContactListSummary, ContactRepositoryInterface } from "../../../repositories/interface/contact-repository-interface";
import { ListContactRequestQuerySchema } from "../../../zod/contact/list-contact-query-schema";

const PAGE_SIZE = 10;

type ListContactsResponse = {
  success: true;
  message: string;
  data: {
    contactList: Contact[];
    summary?: ContactListSummary;
  };
  count: number;
  type: "List";
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

class ListContactsUseCase {
  constructor(private contactRepository: ContactRepositoryInterface) { }

  async execute(query: ListContactRequestQuerySchema): Promise<ListContactsResponse> {
    const dbQuery: ContactListDbQuery = {
      venueId: query.venueId,
      name: query.name,
      type: query.type,
      q: query.q,
      category: query.category,
      ...(query.page !== undefined && {
        skip: (query.page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    };
    const summaryQuery: ContactListDbQuery = {
      venueId: dbQuery.venueId,
      name: dbQuery.name,
      type: dbQuery.type,
      q: dbQuery.q,
      category: dbQuery.category,
    };

    const [{ items, total }, summary] = await Promise.all([
      this.contactRepository.list(dbQuery),
      query.summary ? this.contactRepository.summarize(summaryQuery) : Promise.resolve(null),
    ]);

    const body = {
      success: true as const,
      message: `Lista de contactos com ${items.length} items`,
      data: {
        contactList: items,
        ...(summary ? { summary } : {}),
      },
      count: items.length,
      type: "List" as const,
    };

    if (query.page === undefined) return body;

    return {
      ...body,
      pagination: {
        page: query.page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / PAGE_SIZE),
      },
    };
  }
}

export { ListContactsUseCase };
