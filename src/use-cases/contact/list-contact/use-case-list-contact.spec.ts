import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { Contact, ContactType, PartnerCategory } from "@prisma/client";
import { handleErrors } from "../../../errors/error-handler";
import { ContactListDbQuery, ContactRepositoryInterface } from "../../../repositories/interface/contact-repository-interface";
import { listContactRequestQuerySchema } from "../../../zod/contact/list-contact-query-schema";
import { ListContactsUseCase } from "./use-case-list-contact";

type Row = Pick<Contact, "id" | "name" | "role" | "whatsapp" | "email" | "venueId" | "type" | "category" | "logoUrl" | "description">;

function row(index: number, extra: Partial<Row> = {}): Row {
  const n = String(index).padStart(2, "0");
  return {
    id: `c-${n}`,
    name: `Contato ${n}`,
    role: "Buffet",
    whatsapp: `119000000${n}`,
    email: `c${n}@mail.test`,
    venueId: "venue-1",
    type: ContactType.SUPPLIER,
    category: PartnerCategory.BUFFET,
    logoUrl: `https://cdn.test/${n}.png`,
    description: `Descricao ${n}`,
    ...extra,
  };
}

function includes(value: string | null, term: string) {
  return (value ?? "").toLowerCase().includes(term.toLowerCase());
}

function filled(value: string | null) {
  return (value ?? "").trim().length > 0;
}

function matches(item: Row, query: ContactListDbQuery) {
  if (item.venueId !== query.venueId) return false;
  if (query.type && item.type !== query.type) return false;
  if (query.category && item.category !== query.category) return false;
  if (query.name && !includes(item.name, query.name)) return false;
  if (query.q) {
    const hit = includes(item.name, query.q)
      || includes(item.role, query.q)
      || includes(item.whatsapp, query.q)
      || includes(item.email, query.q);
    if (!hit) return false;
  }
  return true;
}

function harness(rows: Row[]) {
  const listCalls: ContactListDbQuery[] = [];
  const summaryCalls: ContactListDbQuery[] = [];
  const repository = {
    list: vi.fn(async (query: ContactListDbQuery) => {
      listCalls.push(query);
      const all = rows
        .filter((item) => matches(item, query))
        .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
      const items = query.take === undefined ? all : all.slice(query.skip ?? 0, (query.skip ?? 0) + query.take);
      return { items, total: all.length };
    }),
    summarize: vi.fn(async (query: ContactListDbQuery) => {
      summaryCalls.push(query);
      const all = rows.filter((item) => matches(item, query));
      return {
        total: all.length,
        withLogo: all.filter((item) => filled(item.logoUrl)).length,
        withDescription: all.filter((item) => filled(item.description)).length,
      };
    }),
  } as unknown as ContactRepositoryInterface;
  return { listCalls, summaryCalls, useCase: new ListContactsUseCase(repository), repository };
}

describe("listar contatos", () => {
  it("pagina de 10 com total do filtro", async () => {
    const { useCase, listCalls } = harness(Array.from({ length: 25 }, (_, index) => row(index + 1)));
    const first = await useCase.execute({ venueId: "venue-1", page: 1, summary: false });
    const third = await useCase.execute({ venueId: "venue-1", page: 3, summary: false });

    expect(first.data.contactList).toHaveLength(10);
    expect(first.pagination).toEqual({ page: 1, pageSize: 10, total: 25, totalPages: 3 });
    expect(third.data.contactList).toHaveLength(5);
    expect(third.pagination?.total).toBe(25);
    expect(listCalls[0]).toMatchObject({ skip: 0, take: 10 });
    expect(listCalls[1]).toMatchObject({ skip: 20, take: 10 });
  });

  it("q casa funcao, WhatsApp ou e-mail, nao so o nome", async () => {
    const { useCase } = harness([
      row(1, { name: "Ana", role: "Churrasco", whatsapp: "110", email: "ana@mail.test" }),
      row(2, { name: "Beto", role: "Bar", whatsapp: "11988887777", email: "beto@mail.test" }),
      row(3, { name: "Caio", role: "DJ", whatsapp: "110", email: "foto@mail.test" }),
      row(4, { name: "Duda", role: "Bar", whatsapp: "110", email: "duda@mail.test" }),
    ]);

    const byRole = await useCase.execute({ venueId: "venue-1", q: "churrasco", page: 1, summary: false });
    const byPhone = await useCase.execute({ venueId: "venue-1", q: "98888", page: 1, summary: false });
    const byEmail = await useCase.execute({ venueId: "venue-1", q: "foto@", page: 1, summary: false });

    expect(byRole.data.contactList.map((item) => item.name)).toEqual(["Ana"]);
    expect(byPhone.data.contactList.map((item) => item.name)).toEqual(["Beto"]);
    expect(byEmail.data.contactList.map((item) => item.name)).toEqual(["Caio"]);
  });

  it("category OUTROS nao inclui contato com categoria nula", async () => {
    const { useCase } = harness([
      row(1, { name: "Outro", category: PartnerCategory.OUTROS }),
      row(2, { name: "Sem categoria", category: null }),
      row(3, { name: "Bar", category: PartnerCategory.BAR }),
    ]);
    const response = await useCase.execute({
      venueId: "venue-1",
      category: "OUTROS",
      page: 1,
      summary: true,
    });
    expect(response.data.contactList.map((item) => item.name)).toEqual(["Outro"]);
    expect(response.data.summary).toMatchObject({ total: 1 });
    expect(response.pagination?.total).toBe(1);
  });

  it("resumo usa o filtro inteiro e logo em branco nao conta", async () => {
    const rows = Array.from({ length: 12 }, (_, index) => row(index + 1, {
      logoUrl: index === 0 ? "   " : `https://cdn.test/${index}.png`,
      description: index < 2 ? "  " : `Descricao ${index}`,
    }));
    const { useCase, summaryCalls } = harness(rows);
    const response = await useCase.execute({ venueId: "venue-1", page: 1, summary: true });

    expect(response.data.contactList).toHaveLength(10);
    expect(response.pagination).toEqual({ page: 1, pageSize: 10, total: 12, totalPages: 2 });
    expect(response.data.summary).toEqual({ total: 12, withLogo: 11, withDescription: 10 });
    expect(summaryCalls[0]).not.toHaveProperty("skip");
    expect(summaryCalls[0]).not.toHaveProperty("take");
  });

  it("summary sem pagina responde 400 e sem pagina devolve a lista inteira", async () => {
    const { useCase, repository } = harness([row(1), row(2), row(3), row(4)]);
    const response = await useCase.execute({ venueId: "venue-1", summary: false });
    expect(response.data.contactList).toHaveLength(4);
    expect(response.data.summary).toBeUndefined();
    expect(response).not.toHaveProperty("pagination");
    expect(repository.summarize).not.toHaveBeenCalled();

    try {
      listContactRequestQuerySchema.parse({ venueId: "venue-1", summary: "true" });
      throw new Error("deveria recusar");
    } catch (error) {
      expect(handleErrors(error).statusCode).toBe(400);
    }
  });

  it("ordem por nome desempata por id", async () => {
    const { useCase } = harness([
      row(2, { id: "c-b", name: "Ana" }),
      row(1, { id: "c-a", name: "Ana" }),
      row(3, { id: "c-c", name: "Bruno" }),
    ]);
    const response = await useCase.execute({ venueId: "venue-1", page: 1, summary: false });
    expect(response.data.contactList.map((item) => item.id)).toEqual(["c-a", "c-b", "c-c"]);
  });

  it("query aceita pagina, busca e categoria e nao cria coluna nem indice", () => {
    const parsed = listContactRequestQuerySchema.parse({
      venueId: "venue-1",
      page: "2",
      q: "  dj  ",
      category: "DJ",
      type: "SUPPLIER",
      summary: "true",
      pageSize: "50",
    });
    expect(parsed).toMatchObject({
      page: 2,
      q: "dj",
      category: "DJ",
      type: "SUPPLIER",
      summary: true,
    });
    expect(parsed).not.toHaveProperty("pageSize");
    expect(() => listContactRequestQuerySchema.parse({ venueId: "venue-1", q: "x".repeat(81) })).toThrow();
    expect(() => listContactRequestQuerySchema.parse({ venueId: "venue-1", category: "NOPE" })).toThrow();

    const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
    const contact = schema.slice(schema.indexOf("model Contact {"), schema.indexOf("model ProposalIndication"));
    expect(contact).toContain("@@index([venueId])");
    expect(contact.match(/@@index\(/g)).toHaveLength(1);
    expect(contact).not.toContain("withLogo");
  });
});
