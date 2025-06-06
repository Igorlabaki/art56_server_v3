import { Request, Response } from "express";
import { CreateEmailConfigUseCase } from "../use-cases/email-config/create-email-config/create-email-config-use-case";
import { DeleteEmailConfigUseCase } from "../use-cases/email-config/delete-email-config/delete-email-config-use-case";
import { ListEmailConfigUseCase } from "../use-cases/email-config/list-email-config/list-email-config-use-case";
import { UpdateEmailConfigUseCase } from "../use-cases/email-config/update-email-config/update-email-config-use-case";
import { listEmailConfigQuerySchema } from "../zod/email-config/list-email-config-query-schema";

export class EmailConfigController {
  constructor(
    private readonly createEmailConfigUseCase: CreateEmailConfigUseCase,
    private readonly updateEmailConfigUseCase: UpdateEmailConfigUseCase,
    private readonly deleteEmailConfigUseCase: DeleteEmailConfigUseCase,
    private readonly listEmailConfigUseCase: ListEmailConfigUseCase
  ) {}

  async create(request: Request, response: Response) {
    try {
      const emailConfig = await this.createEmailConfigUseCase.execute(request.body);

      return response.status(201).json(emailConfig);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: "Internal server error" });
    }
  }

  async update(request: Request, response: Response) {
    try {
      const emailConfig = await this.updateEmailConfigUseCase.execute(request.body);

      return response.status(200).json(emailConfig);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: "Internal server error" });
    }
  }

  async delete(request: Request, response: Response) {
    try {
      const { id } = request.params;

      await this.deleteEmailConfigUseCase.execute(id);

      return response.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: "Internal server error" });
    }
  }

  async list(request: Request, response: Response) {
    try {
      const params = listEmailConfigQuerySchema.parse(request.query);
      const emailConfigs = await this.listEmailConfigUseCase.execute(params);

      return response.status(200).json(emailConfigs);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: "Internal server error" });
    }
  }
} 