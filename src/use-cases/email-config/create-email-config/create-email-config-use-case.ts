import { EmailConfigRepositoryInterface } from "../../../repositories/interface/email-config-repository-interface";
import { CreateEmailConfigParamsSchema, createEmailConfigParamsSchema } from "../../../zod/email-config/create-email-config-params-schema";

export class CreateEmailConfigUseCase {
  constructor(
    private readonly emailConfigRepository: EmailConfigRepositoryInterface
  ) {}

  async execute(params: CreateEmailConfigParamsSchema) {

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