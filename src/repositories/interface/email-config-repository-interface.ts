import { createEmailConfigParamsSchema } from "../../zod/email-config/create-email-config-params-schema";
import { listEmailConfigQuerySchema } from "../../zod/email-config/list-email-config-query-schema";
import { updateEmailConfigParamsSchema } from "../../zod/email-config/update-email-config-params-schema";

interface EmailConfig {
  id: string;
  backgroundImageUrl?: string | null;
  title?: string | null;
  type: string;
  message?: string | null;
  venueId: string;
}

export interface ValidateEmailConfigTypeParams {
  type: string;
  venueId: string;
  emailConfigId?: string;
}

export interface EmailConfigRepositoryInterface {
  delete: (params: string) => Promise<EmailConfig | null>;
  getById: (params: string) => Promise<EmailConfig | null>;
  getByType: (params: {venueId:string, type:string}) => Promise<EmailConfig | null>;
  update: (params: typeof updateEmailConfigParamsSchema._type) => Promise<EmailConfig | null>;
  create: (params: typeof createEmailConfigParamsSchema._type) => Promise<EmailConfig | null>;
  list: (params: typeof listEmailConfigQuerySchema._type) => Promise<EmailConfig[] | null>;
} 