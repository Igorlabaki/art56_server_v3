import { EmailConfigRepositoryInterface } from "../../../repositories/interface/email-config-repository-interface";

export class DeleteEmailConfigUseCase {
  constructor(
    private readonly emailConfigRepository: EmailConfigRepositoryInterface
  ) {}

  async execute(id: string) {
    const emailConfigExists = await this.emailConfigRepository.getById(id);

    if (!emailConfigExists) {
      throw new Error("Email config not found");
    }

    await this.emailConfigRepository.delete(id);

    const formatedResponse = {
      success: true,
      message: `Configuração de email do tipo ${emailConfigExists.type} deletada com sucesso`,
      data: null,
      count: 0,
      type: "EmailConfig"
    }

    return formatedResponse;
  }
} 