import { EmailConfigRepositoryInterface } from "../../../repositories/interface/email-config-repository-interface";
import { createEmailConfigParamsSchema } from "../../../zod/email-config/create-email-config-params-schema";

export class CreateEmailConfigUseCase {
  constructor(
    private readonly emailConfigRepository: EmailConfigRepositoryInterface
  ) {}

  async execute(params: typeof createEmailConfigParamsSchema._type) {
    const emailConfigExists = await this.emailConfigRepository.validateIfExistEmailConfigType({
      type: params.type,
      venueId: params.venueId
    });

    if (emailConfigExists) {
      throw new Error("Email config already exists for this type and venue");
    }

    const emailConfig = await this.emailConfigRepository.create(params);

    return emailConfig;
  }
} 