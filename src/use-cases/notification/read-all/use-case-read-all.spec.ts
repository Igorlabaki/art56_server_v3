import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { handleErrors } from "../../../errors/error-handler";
import { NotificationRepositoryInterface } from "../../../repositories/interface/notification-repository-interface";
import { UserVenuePermissionRepositoryInterface } from "../../../repositories/interface/user-venue-permission-repository-interface";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { ReadAllNotificationsUseCase } from "./use-case-read-all";

type Note = { id: string; venueId: string; isRead: boolean };

function harness(options?: { venue?: boolean; allowed?: boolean }) {
  const notes: Note[] = [
    { id: "n-1", venueId: "venue-1", isRead: false },
    { id: "n-2", venueId: "venue-1", isRead: true },
    { id: "n-3", venueId: "venue-2", isRead: false },
  ];
  const calls: Array<{ venueId: string; proposalId?: string }> = [];
  const venueExists = options?.venue !== false;
  const allowed = options?.allowed !== false;

  const notificationRepository = {
    markUnreadAsRead: vi.fn(async (params: { venueId: string; proposalId?: string }) => {
      calls.push(params);
      let updated = 0;
      for (const note of notes) {
        if (note.venueId === params.venueId && params.proposalId === undefined && !note.isRead) {
          note.isRead = true;
          updated += 1;
        }
      }
      return updated;
    }),
  } as unknown as NotificationRepositoryInterface;

  const venueRepository = {
    getById: vi.fn(async () => (venueExists ? { id: "venue-1", organizationId: "org-1" } : null)),
  } as unknown as VenueRepositoryInterface;

  const userVenuePermissionRepository = {
    getUserVenuePermission: vi.fn(async () => (allowed ? { id: "perm-1" } : null)),
  } as unknown as UserVenuePermissionRepositoryInterface;

  const useCase = new ReadAllNotificationsUseCase(
    notificationRepository,
    venueRepository,
    userVenuePermissionRepository,
  );

  return { notes, calls, useCase, notificationRepository };
}

describe("marcar todas as notificacoes do espaco como lidas", () => {
  it("grava so as nao lidas daquele espaco e ignora filtro", async () => {
    const { notes, calls, useCase } = harness();
    const response = await useCase.execute({ venueId: "venue-1", userId: "user-1" });

    expect(response.data.updated).toBe(1);
    expect(calls[0]).toEqual({ venueId: "venue-1" });
    expect(Object.keys(calls[0])).toEqual(["venueId"]);
    expect(notes.find((note) => note.id === "n-2")?.isRead).toBe(true);
    expect(notes.find((note) => note.id === "n-3")?.isRead).toBe(false);
  });

  it("a segunda chamada atualiza zero linhas", async () => {
    const { useCase } = harness();
    await useCase.execute({ venueId: "venue-1", userId: "user-1" });
    const again = await useCase.execute({ venueId: "venue-1", userId: "user-1" });
    expect(again.data.updated).toBe(0);
  });

  it("sem permissao responde 403 e nao escreve; espaco ausente responde 404", async () => {
    const denied = harness({ allowed: false });
    await expect(denied.useCase.execute({ venueId: "venue-1", userId: "user-1" })).rejects.toSatisfy((error: unknown) => {
      return handleErrors(error).statusCode === 403;
    });
    expect(denied.notificationRepository.markUnreadAsRead).not.toHaveBeenCalled();

    const missing = harness({ venue: false });
    await expect(missing.useCase.execute({ venueId: "venue-x", userId: "user-1" })).rejects.toSatisfy((error: unknown) => {
      return handleErrors(error).statusCode === 404;
    });
    expect(missing.notificationRepository.markUnreadAsRead).not.toHaveBeenCalled();
  });

  it("a rota exige sessao", () => {
    const router = readFileSync(resolve(process.cwd(), "src/router/notification.ts"), "utf8");
    expect(router).toContain('patch("/read-all/:venueId", ensureAuthenticate');
  });
});
