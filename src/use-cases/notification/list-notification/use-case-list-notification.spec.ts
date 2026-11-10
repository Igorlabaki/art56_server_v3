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
      const now = (query.now ?? new Date()).getTime();
      const all = rows.filter((item) => matches(item, query));
      const inWindow = (item: Row, fromDays: number, toDays = 0) =>
        item.createdAt.getTime() >= now - fromDays * DAY_MS && (toDays === 0 || item.createdAt.getTime() < now - toDays * DAY_MS);
      const unreadBlocked = query.isRead === true;
      const proposalsBlocked = query.type !== undefined && query.type !== NotificationType.PROPOSAL;
      const proposals = (fromDays: number, toDays = 0) =>
        proposalsBlocked ? 0 : all.filter((item) => item.type === NotificationType.PROPOSAL && inWindow(item, fromDays, toDays)).length;
      return {
        unread: unreadBlocked ? 0 : all.filter((item) => !item.isRead).length,
        last7Days: all.filter((item) => inWindow(item, 7)).length,
        last30Days: all.filter((item) => inWindow(item, 30)).length,
        newProposals: proposals(30),
        previous: {
          last7Days: all.filter((item) => inWindow(item, 14, 7)).length,
          last30Days: all.filter((item) => inWindow(item, 60, 30)).length,
          newProposals: proposals(60, 30),
        },
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

  it("janelas anteriores de 7 e 30 dias encostam nas atuais sem sobrepor", () => {
    const now = new Date("2026-11-05T12:00:00.000Z");
    const ago = (days: number) => new Date(now.getTime() - days * DAY_MS);
    const { previous } = notificationSummaryWheres({ venueId: "venue-1" }, now);
    expect(previous.last7Days.createdAt).toEqual({ gte: ago(14), lt: ago(7) });
    expect(previous.last30Days.createdAt).toEqual({ gte: ago(60), lt: ago(30) });
    expect(previous.newProposals).toMatchObject({ type: "PROPOSAL", createdAt: { gte: ago(60), lt: ago(30) } });
  });

  it("janelas anteriores carregam busca, tipo e leitura; tipo fora de orcamento zera orcamentos anteriores", () => {
    const now = new Date("2026-11-05T12:00:00.000Z");
    const filtered = notificationSummaryWheres({ venueId: "venue-1", q: "ana", type: "PROPOSAL", isRead: false }, now).previous;
    for (const where of [filtered.last7Days, filtered.last30Days, filtered.newProposals]) {
      expect(where).toMatchObject({ venueId: "venue-1", content: { contains: "ana" }, type: "PROPOSAL", isRead: false });
    }
    expect(notificationSummaryWheres({ venueId: "venue-1", type: "VISIT" }, now).previous.newProposals).toBeNull();
  });

  it("summary.change compara cada periodo com a janela anterior e devolve null sem base", async () => {
    const now = new Date();
    const at = (days: number) => new Date(now.getTime() - days * DAY_MS + 60_000);
    const { useCase } = harness([
      ...Array.from({ length: 3 }, (_, index) => row(index + 1, { createdAt: at(1) })),
      ...Array.from({ length: 2 }, (_, index) => row(index + 4, { createdAt: at(8) })),
      ...Array.from({ length: 5 }, (_, index) => row(index + 6, { type: NotificationType.VISIT, createdAt: at(40) })),
    ]);
    const response = await useCase.execute({ venueId: "venue-1", page: 1, summary: true });

    expect(response.data.summary).toMatchObject({ last7Days: 3, last30Days: 5, newProposals: 5 });
    expect(response.data.summary?.change).toEqual({ last7Days: 50, last30Days: 0, newProposals: null });
    expect(response.data.summary).not.toHaveProperty("previous");
  });

  it("summary.change com tipo Orcamento iguala 30 dias e orcamentos novos; outro tipo zera os dois lados", async () => {
    const now = new Date();
    const at = (days: number) => new Date(now.getTime() - days * DAY_MS + 60_000);
    const rows = [
      ...Array.from({ length: 4 }, (_, index) => row(index + 1, { createdAt: at(2) })),
      ...Array.from({ length: 2 }, (_, index) => row(index + 5, { createdAt: at(45) })),
      row(7, { type: NotificationType.VISIT, createdAt: at(2) }),
    ];
    const { useCase } = harness(rows);
    const proposals = await useCase.execute({ venueId: "venue-1", type: "PROPOSAL", page: 1, summary: true });
    const visits = await useCase.execute({ venueId: "venue-1", type: "VISIT", page: 1, summary: true });

    expect(proposals.data.summary?.last30Days).toBe(proposals.data.summary?.newProposals);
    expect(proposals.data.summary?.change.last30Days).toBe(100);
    expect(proposals.data.summary?.change.newProposals).toBe(100);
    expect(visits.data.summary?.newProposals).toBe(0);
    expect(visits.data.summary?.change.newProposals).toBeNull();
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
