import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { NotificationRepositoryInterface } from "../../../repositories/interface/notification-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { UserVenuePermissionRepositoryInterface } from "../../../repositories/interface/user-venue-permission-repository-interface";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";

class ReadNotificationsByProposalUseCase {
  constructor(
    private notificationRepository: NotificationRepositoryInterface,
    private proposalRepository: ProposalRepositoryInterface,
    private venueRepository: VenueRepositoryInterface,
    private userVenuePermissionRepository: UserVenuePermissionRepositoryInterface,
  ) { }

  async execute(params: { proposalId: string; userId: string }) {
    const proposal = await this.proposalRepository.getById(params.proposalId);
    if (!proposal) {
      throw new HttpResourceNotFoundError("Orcamento");
    }

    const venue = await this.venueRepository.getById({ venueId: proposal.venueId });
    if (!venue) {
      throw new HttpResourceNotFoundError("Locacao");
    }

    const permission = await this.userVenuePermissionRepository.getUserVenuePermission({
      organizationId: venue.organizationId,
      userId: params.userId,
      venueId: venue.id,
    });
    if (!permission) {
      throw new HttpForbiddenError("Voce nao tem permissao neste espaco");
    }

    const updated = await this.notificationRepository.markUnreadAsRead({
      venueId: venue.id,
      proposalId: proposal.id,
    });

    return {
      success: true as const,
      message: `${updated} notificacoes marcadas como lidas`,
      data: { updated },
      count: updated,
      type: "Update" as const,
    };
  }
}

export { ReadNotificationsByProposalUseCase };
