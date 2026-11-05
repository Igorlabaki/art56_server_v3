import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { assertContactLogoFile, readContactBody, readRemoveLogo } from "../../../functions/contact-logo";
import { deleteContactLogo, uploadContactLogo } from "../../../functions/contact-logo-storage";
import { UpdateContactRequestParams, updateContactSchema } from "../../../zod/contact/update-contact-params-schema";
import { UpdateContactUseCase } from "./use-case-update-contact";

type UploadedLogo = { buffer: Buffer; size: number; mimetype: string };

class UpdateContactController {
    constructor(private updateContactUseCase: UpdateContactUseCase) { }

    async handle(req: Request & { file?: UploadedLogo }, resp: Response) {
        try {
            const parsed = updateContactSchema.parse(readContactBody(req.body));
            const removeLogo = readRemoveLogo(req.body);
            const shouldLoad = Boolean(req.file) || removeLogo || parsed.data.type === "TEAM_MEMBER";
            const current = shouldLoad ? await this.updateContactUseCase.load(parsed.contactId) : null;
            const nextType = parsed.data.type ?? current?.type ?? undefined;

            if (req.file && nextType !== "SUPPLIER") {
                throw new HttpBadRequestError("Membro da equipe nao tem logo nem descricao");
            }
            if (req.file) assertContactLogoFile(req.file);

            let logoUrl: string | null | undefined;
            if (nextType === "TEAM_MEMBER") {
                logoUrl = null;
            } else if (req.file) {
                logoUrl = await uploadContactLogo(req.file);
            } else if (removeLogo) {
                logoUrl = null;
            }

            const param: UpdateContactRequestParams = logoUrl === undefined
                ? parsed
                : { ...parsed, data: { ...parsed.data, logoUrl } };
            const response = await this.updateContactUseCase.execute(param);

            if (current?.logoUrl && logoUrl !== undefined && current.logoUrl !== logoUrl) {
                await deleteContactLogo(current.logoUrl);
            }

            return resp.json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateContactController };
