import { EmailConfigRepositoryInterface } from "../../../repositories/interface/email-config-repository-interface";
import { listEmailConfigQuerySchema } from "../../../zod/email-config/list-email-config-query-schema";

export class ListEmailConfigUseCase {
  constructor(
    private readonly emailConfigRepository: EmailConfigRepositoryInterface
  ) {}

  async execute(params: typeof listEmailConfigQuerySchema._type) {
    const emailConfigs = await this.emailConfigRepository.list(params);

    return emailConfigs;
  }
} 