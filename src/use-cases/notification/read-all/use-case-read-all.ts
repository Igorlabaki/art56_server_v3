import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { NotificationRepositoryInterface } from "../../../repositories/interface/notification-repository-interface";
import { UserVenuePermissionRepositoryInterface } from "../../../repositories/interface/user-venue-permission-repository-interface";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";

class ReadAllNotificationsUseCase {
  constructor(
    private notificationRepository: NotificationRepositoryInterface,
    private venueRepository: VenueRepositoryInterface,
    private userVenuePermissionRepository: UserVenuePermissionRepositoryInterface,
  ) { }

  async execute(params: { venueId: string; userId: string }) {
    const venue = await this.venueRepository.getById({ venueId: params.venueId });
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

    const updated = await this.notificationRepository.markUnreadAsRead({ venueId: venue.id });

    return {
      success: true as const,
      message: `${updated} notificacoes marcadas como lidas`,
      data: { updated },
      count: updated,
      type: "Update" as const,
    };
  }
}

export { ReadAllNotificationsUseCase };
