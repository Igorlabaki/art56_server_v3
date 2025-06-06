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
  }
} 