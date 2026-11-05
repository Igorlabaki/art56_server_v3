import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { handleErrors } from "../../../errors/error-handler";
import { NotificationRepositoryInterface } from "../../../repositories/interface/notification-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { UserVenuePermissionRepositoryInterface } from "../../../repositories/interface/user-venue-permission-repository-interface";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { ReadNotificationsByProposalUseCase } from "./use-case-read-by-proposal";

type Note = { id: string; venueId: string; proposalId: string | null; isRead: boolean };

function harness(options?: { proposal?: { id: string; venueId: string } | null; allowed?: boolean }) {
  const notes: Note[] = [
    { id: "n-1", venueId: "venue-1", proposalId: "proposal-1", isRead: false },
    { id: "n-2", venueId: "venue-1", proposalId: "proposal-1", isRead: false },
    { id: "n-3", venueId: "venue-1", proposalId: "proposal-1", isRead: true },
    { id: "n-4", venueId: "venue-1", proposalId: "proposal-2", isRead: false },
    { id: "n-5", venueId: "venue-2", proposalId: "proposal-1", isRead: false },
  ];
  const calls: Array<{ venueId: string; proposalId?: string }> = [];
  const proposal = options && "proposal" in options ? options.proposal : { id: "proposal-1", venueId: "venue-1" };
  const allowed = options?.allowed !== false;

  const notificationRepository = {
    markUnreadAsRead: vi.fn(async (params: { venueId: string; proposalId?: string }) => {
      calls.push(params);
      let updated = 0;
      for (const note of notes) {
        const sameVenue = note.venueId === params.venueId;
        const sameProposal = params.proposalId === undefined || note.proposalId === params.proposalId;
        if (sameVenue && sameProposal && !note.isRead) {
          note.isRead = true;
          updated += 1;
        }
      }
      return updated;
    }),
  } as unknown as NotificationRepositoryInterface;

  const proposalRepository = {
    getById: vi.fn(async () => proposal),
  } as unknown as ProposalRepositoryInterface;

  const venueRepository = {
    getById: vi.fn(async ({ venueId }: { venueId: string }) => (
      venueId === "venue-1" ? { id: "venue-1", organizationId: "org-1" } : null
    )),
  } as unknown as VenueRepositoryInterface;

  const userVenuePermissionRepository = {
    getUserVenuePermission: vi.fn(async () => (allowed ? { id: "perm-1" } : null)),
  } as unknown as UserVenuePermissionRepositoryInterface;

  const useCase = new ReadNotificationsByProposalUseCase(
    notificationRepository,
    proposalRepository,
    venueRepository,
    userVenuePermissionRepository,
  );

  return { notes, calls, useCase, notificationRepository };
}

describe("marcar notificacoes do orcamento como lidas", () => {
  it("grava so as nao lidas daquele orcamento e daquele espaco", async () => {
    const { notes, calls, useCase } = harness();
    const response = await useCase.execute({ proposalId: "proposal-1", userId: "user-1" });

    expect(response.data.updated).toBe(2);
    expect(calls[0]).toEqual({ venueId: "venue-1", proposalId: "proposal-1" });
    expect(notes.find((note) => note.id === "n-3")?.isRead).toBe(true);
    expect(notes.find((note) => note.id === "n-4")?.isRead).toBe(false);
    expect(notes.find((note) => note.id === "n-5")?.isRead).toBe(false);
  });

  it("a segunda chamada atualiza zero linhas", async () => {
    const { useCase } = harness();
    await useCase.execute({ proposalId: "proposal-1", userId: "user-1" });
    const again = await useCase.execute({ proposalId: "proposal-1", userId: "user-1" });
    expect(again.data.updated).toBe(0);
  });

  it("sem permissao responde 403 e nao escreve; orcamento ausente responde 404", async () => {
    const denied = harness({ allowed: false });
    await expect(denied.useCase.execute({ proposalId: "proposal-1", userId: "user-1" })).rejects.toSatisfy((error: unknown) => {
      return handleErrors(error).statusCode === 403;
    });
    expect(denied.notificationRepository.markUnreadAsRead).not.toHaveBeenCalled();

    const missing = harness({ proposal: null });
    await expect(missing.useCase.execute({ proposalId: "proposal-x", userId: "user-1" })).rejects.toSatisfy((error: unknown) => {
      return handleErrors(error).statusCode === 404;
    });
    expect(missing.notificationRepository.markUnreadAsRead).not.toHaveBeenCalled();
  });

  it("GET do orcamento nao usa repositorio de notificacao", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/use-cases/proposal/get-proposal-by-id/use-case-get-proposal-by-id.ts"),
      "utf8",
    );
    expect(source).not.toContain("notification");
    const router = readFileSync(resolve(process.cwd(), "src/router/notification.ts"), "utf8");
    expect(router).toContain('patch("/read-by-proposal/:proposalId", ensureAuthenticate');
  });
});
