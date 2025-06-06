import { EmailConfigRepositoryInterface } from "../../../repositories/interface/email-config-repository-interface";
import { updateEmailConfigParamsSchema } from "../../../zod/email-config/update-email-config-params-schema";

export class UpdateEmailConfigUseCase {
  constructor(
    private readonly emailConfigRepository: EmailConfigRepositoryInterface
  ) {}

  async execute(params: typeof updateEmailConfigParamsSchema._type) {
    const emailConfigExists = await this.emailConfigRepository.getById(params.emailConfigId);

    if (!emailConfigExists) {
      throw new Error("Email config not found");
    }

    const emailConfig = await this.emailConfigRepository.update(params);

    const formatedResponse = {
      success: true,
      message: `Configuração de email do tipo ${params.type || emailConfigExists.type} atualizada com sucesso`,
      data: emailConfig,
      count: 1,
      type: "EmailConfig"
    }

    return formatedResponse;
  }
} 