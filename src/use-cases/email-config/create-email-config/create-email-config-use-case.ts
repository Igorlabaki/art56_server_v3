import { EmailConfigRepositoryInterface } from "../../../repositories/interface/email-config-repository-interface";
import { assertPhotoBelongsToVenue, VenuePhotoRef } from "../../../functions/venue-photo-ref";
import { CreateEmailConfigParamsSchema } from "../../../zod/email-config/create-email-config-params-schema";

export class CreateEmailConfigUseCase {
  constructor(
    private readonly emailConfigRepository: EmailConfigRepositoryInterface,
    private readonly photos?: { getById: (id: string) => Promise<VenuePhotoRef | null> },
  ) {}

  async execute(params: CreateEmailConfigParamsSchema) {
    if (params.backgroundPhotoId) {
      const photo = assertPhotoBelongsToVenue(await this.photos?.getById(params.backgroundPhotoId), params.venueId);
      params = { ...params, backgroundPhotoId: photo.id, backgroundImageUrl: photo.url };
    }

    const emailConfig = await this.emailConfigRepository.create(params);

    const formatedResponse = {
      success: true,
      message: `Configuração de email do tipo ${params.type} criada com sucesso`,
      data: emailConfig,
      count: 1,
      type: "EmailConfig"
    }

    return formatedResponse;
  }
} 