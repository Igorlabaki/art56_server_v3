import { EmailConfigRepositoryInterface } from "../../../repositories/interface/email-config-repository-interface";
import { updateEmailConfigParamsSchema } from "../../../zod/email-config/update-email-config-params-schema";

export class UpdateEmailConfigUseCase {
  constructor(
    private readonly emailConfigRepository: EmailConfigRepositoryInterface
  ) {}

  async execute(params: typeof updateEmailConfigParamsSchema._type) {
    const emailConfigExists = await this.emailConfigRepository.getById(params.id);

    if (!emailConfigExists) {
      throw new Error("Email config not found");
    }

    if (params.type) {
      const emailConfigWithSameType = await this.emailConfigRepository.validateIfExistEmailConfigType({
        type: params.type,
        venueId: params.venueId,
        emailConfigId: params.id
      });

      if (emailConfigWithSameType) {
        throw new Error("Email config already exists for this type and venue");
      }
    }

    const emailConfig = await this.emailConfigRepository.update(params);

    return emailConfig;
  }
} 