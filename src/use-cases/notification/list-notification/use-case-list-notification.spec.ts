import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { Notification, NotificationType } from "@prisma/client";
import { handleErrors } from "../../../errors/error-handler";
import { NotificationListDbQuery, NotificationRepositoryInterface } from "../../../repositories/interface/notification-repository-interface";
import { notificationSummaryWheres } from "../../../repositories/in-prisma/notification-in-prisma-repository";
import { listNotificationRequestQuerySchema } from "../../../zod/notification/list-notification-query-schema";
import { ListNotificationsUseCase } from "./use-case-list-notification";

const DAY_MS = 24 * 60 * 60 * 1000;

type Row = Pick<Notification, "id" | "venueId" | "content" | "type" | "isRead" | "createdAt" | "proposalId" | "dateEventId">;

function row(index: number, extra: Partial<Row> = {}): Row {
  const n = String(index).padStart(2, "0");
  return {
    id: `n-${n}`,
    venueId: "venue-1",
    content: `Aviso ${n}`,
    type: NotificationType.PROPOSAL,
    isRead: false,
    createdAt: new Date(Date.UTC(2026, 0, 1, 12, 0, index)),
    proposalId: `p-${n}`,
    dateEventId: null,
    ...extra,
  };
}

function includes(value: string, term: string) {
  return value.toLowerCase().includes(term.toLowerCase());
}

function matches(item: Row, query: NotificationListDbQuery) {
  if (item.venueId !== query.venueId) return false;
  if (query.q && !includes(item.content, query.q)) return false;
  if (query.type && item.type !== query.type) return false;
  if (query.isRead !== undefined && item.isRead !== query.isRead) return false;
  return true;
}

function harness(rows: Row[]) {
  const listCalls: NotificationListDbQuery[] = [];
  const summaryCalls: NotificationListDbQuery[] = [];
  const repository = {
    list: vi.fn(async (query: NotificationListDbQuery) => {
      listCalls.push(query);
      const all = rows
        .filter((item) => matches(item, query))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id.localeCompare(a.id));
      const start = query.skip ?? 0;
      const items = query.take === undefined ? all : all.slice(start, start + query.take);
      return { items, total: all.length };
    }),
    summarize: vi.fn(async (query: NotificationListDbQuery) => {
      summaryCalls.push(query);
      const now = query.now ?? new Date();
      const since7 = now.getTime() - 7 * DAY_MS;
      const since30 = now.getTime() - 30 * DAY_MS;
      const all = rows.filter((item) => matches(item, query));
      const inWindow = (item: Row, since: number) => item.createdAt.getTime() >= since;
      const unreadBlocked = query.isRead === true;
      const proposalsBlocked = query.type !== undefined && query.type !== NotificationType.PROPOSAL;
      return {
        unread: unreadBlocked ? 0 : all.filter((item) => !item.isRead).length,
        last7Days: all.filter((item) => inWindow(item, since7)).length,
        last30Days: all.filter((item) => inWindow(item, since30)).length,
        newProposals: proposalsBlocked ? 0 : all.filter((item) => item.type === NotificationType.PROPOSAL && inWindow(item, since30)).length,
      };
    }),
  } as unknown as NotificationRepositoryInterface;
  return { listCalls, summaryCalls, useCase: new ListNotificationsUseCase(repository), repository };
}

describe("listar notificacoes", () => {
  it("pagina de 10 com total do filtro", async () => {
    const { useCase, listCalls } = harness(Array.from({ length: 25 }, (_, index) => row(index + 1)));
    const first = await useCase.execute({ venueId: "venue-1", page: 1, summary: false });
    const third = await useCase.execute({ venueId: "venue-1", page: 3, summary: false });

    expect(first.data.notificationList).toHaveLength(10);
    expect(first.pagination).toEqual({ page: 1, pageSize: 10, total: 25, totalPages: 3 });
    expect(third.data.notificationList).toHaveLength(5);
    expect(third.pagination?.total).toBe(25);
    expect(listCalls[0]).toMatchObject({ skip: 0, take: 10 });
    expect(listCalls[1]).toMatchObject({ skip: 20, take: 10 });
  });

  it("q casa o conteudo", async () => {
    const { useCase } = harness([
      row(1, { content: "Visita da Ana" }),
      row(2, { content: "Orcamento do Bruno" }),
    ]);
    const response = await useCase.execute({ venueId: "venue-1", q: "ana", page: 1, summary: false });
    expect(response.data.notificationList.map((item) => item.id)).toEqual(["n-01"]);
  });

  it("summary.unread e o total nao lido do filtro, nao o tamanho da pagina", async () => {
    const now = new Date("2026-11-05T12:00:00.000Z");
    const rows = [
      ...Array.from({ length: 10 }, (_, index) => row(index + 1, { isRead: true, createdAt: new Date(now.getTime() - DAY_MS) })),
      ...Array.from({ length: 12 }, (_, index) => row(index + 11, { isRead: false, createdAt: new Date(now.getTime() - 2 * DAY_MS) })),
    ];
    const { useCase, summaryCalls } = harness(rows);
    const response = await useCase.execute({ venueId: "venue-1", page: 1, summary: true });

    expect(response.data.notificationList).toHaveLength(10);
    expect(response.pagination?.total).toBe(22);
    expect(response.data.summary?.unread).toBe(12);
    expect(summaryCalls[0]).not.toHaveProperty("skip");
    expect(summaryCalls[0]).not.toHaveProperty("take");
    expect(summaryCalls[0]).toMatchObject({ venueId: "venue-1" });
  });

  it("type VISIT zera orcamentos novos e isRead true zera nao lidas", async () => {
    const now = new Date();
    const { useCase } = harness([
      row(1, { type: NotificationType.VISIT, isRead: false, createdAt: now }),
      row(2, { type: NotificationType.PROPOSAL, isRead: true, createdAt: now }),
    ]);
    const visits = await useCase.execute({ venueId: "venue-1", type: "VISIT", page: 1, summary: true });
    const read = await useCase.execute({ venueId: "venue-1", isRead: true, page: 1, summary: true });

    expect(visits.data.summary?.newProposals).toBe(0);
    expect(visits.data.summary?.unread).toBe(1);
    expect(read.data.summary?.unread).toBe(0);
    expect(read.data.summary?.newProposals).toBe(1);
  });

  it("janelas de 7 e 30 dias e orcamentos novos usam o instante informado", async () => {
    const now = new Date("2026-11-05T12:00:00.000Z");
    const wheres = notificationSummaryWheres({ venueId: "venue-1" }, now);
    expect(wheres.last7Days.createdAt).toEqual({ gte: new Date(now.getTime() - 7 * DAY_MS) });
    expect(wheres.last30Days.createdAt).toEqual({ gte: new Date(now.getTime() - 30 * DAY_MS) });
    expect(wheres.newProposals).toMatchObject({ type: "PROPOSAL", createdAt: { gte: new Date(now.getTime() - 30 * DAY_MS) } });
    expect(notificationSummaryWheres({ venueId: "venue-1", type: "VISIT" }, now).newProposals).toBeNull();
    expect(notificationSummaryWheres({ venueId: "venue-1", isRead: true }, now).unread).toBeNull();
  });

  it("summary sem pagina responde 400 e sem pagina devolve no maximo 25", async () => {
    const { useCase, repository } = harness(Array.from({ length: 30 }, (_, index) => row(index + 1)));
    const response = await useCase.execute({ venueId: "venue-1", summary: false });
    expect(response.data.notificationList).toHaveLength(25);
    expect(response.data.summary).toBeUndefined();
    expect(response).not.toHaveProperty("pagination");
    expect(repository.summarize).not.toHaveBeenCalled();

    try {
      listNotificationRequestQuerySchema.parse({ venueId: "venue-1", summary: "true" });
      throw new Error("deveria recusar");
    } catch (error) {
      expect(handleErrors(error).statusCode).toBe(400);
    }
  });

  it("ordem por createdAt desempata por id", async () => {
    const createdAt = new Date("2026-11-01T00:00:00.000Z");
    const { useCase } = harness([
      row(1, { id: "n-a", createdAt }),
      row(2, { id: "n-c", createdAt }),
      row(3, { id: "n-b", createdAt: new Date("2026-11-02T00:00:00.000Z") }),
    ]);
    const response = await useCase.execute({ venueId: "venue-1", page: 1, summary: false });
    expect(response.data.notificationList.map((item) => item.id)).toEqual(["n-b", "n-c", "n-a"]);
  });

  it("query aceita pagina, busca e tipo e nao cria coluna nem indice", () => {
    const parsed = listNotificationRequestQuerySchema.parse({
      venueId: "venue-1",
      page: "2",
      q: "  visita  ",
      type: "VISIT",
      isRead: "false",
      summary: "true",
      pageSize: "50",
    });
    expect(parsed).toMatchObject({
      page: 2,
      q: "visita",
      type: "VISIT",
      isRead: false,
      summary: true,
    });
    expect(parsed).not.toHaveProperty("pageSize");
    expect(() => listNotificationRequestQuerySchema.parse({ venueId: "venue-1", q: "x".repeat(81) })).toThrow();
    expect(() => listNotificationRequestQuerySchema.parse({ venueId: "venue-1", type: "NOPE" })).toThrow();

    const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
    const model = schema.slice(schema.indexOf("model Notification {"), schema.indexOf("model DateEvent {"));
    expect(model.match(/@@index\(/g)).toHaveLength(3);
    expect(model).toContain("@@index([venueId])");
    expect(model).not.toContain("last7Days");
    expect(model).not.toContain("newProposals");
  });
});
