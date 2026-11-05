import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { assertContactLogoFile, readContactBody } from "../../../functions/contact-logo";
import { uploadContactLogo } from "../../../functions/contact-logo-storage";
import { CreateContactRequestParams, createContactSchema } from "../../../zod/contact/create-contact-params-schema";
import { CreateContactUseCase } from "./use-case-create-contact";

type UploadedLogo = { buffer: Buffer; size: number; mimetype: string };

class CreateContactController {
  constructor(private createContactUseCase: CreateContactUseCase) {}

  async handle(req: Request & { file?: UploadedLogo }, resp: Response) {
    try {
        const parsed = createContactSchema.parse(readContactBody(req.body));
        const type = parsed.type ?? "TEAM_MEMBER";
        if (req.file && type !== "SUPPLIER") {
            throw new HttpBadRequestError("Membro da equipe nao tem logo nem descricao");
        }
        if (req.file) assertContactLogoFile(req.file);
        const body: CreateContactRequestParams = req.file
            ? { ...parsed, logoUrl: await uploadContactLogo(req.file) }
            : parsed;
        const response = await this.createContactUseCase.execute(body);
        return resp.status(201).json(response);

    } catch (error) {
        const errorResponse = handleErrors(error);
        return resp.status(errorResponse.statusCode).json(errorResponse.body);
    }
}
}

export { CreateContactController };
