import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { getByIdProposalSchema } from "../../../zod/proposal/get-by-id-proposal-params-schema";
import { recalculatePublicProposalBodySchema } from "../../../zod/proposal/recalculate-public-proposal-schema";
import { RecalculatePublicProposalUseCase } from "./use-case-recalculate-public-proposal";

const PUBLIC_DATA_KEYS = [
    "id",
    "startDate",
    "endDate",
    "guestNumber",
    "basePrice",
    "extraHoursQty",
    "extraHourPrice",
    "totalAmount",
] as const;

class RecalculatePublicProposalController {
    constructor(private recalculatePublicProposalUseCase: RecalculatePublicProposalUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const { proposalId } = getByIdProposalSchema.parse(req.params);
            const body = recalculatePublicProposalBodySchema.parse(req.body);
            const result = await this.recalculatePublicProposalUseCase.execute({
                proposalId,
                date: body.date,
                guestNumber: body.guestNumber,
                hours: body.hours,
            });

            const source = result.data as Record<string, unknown>;
            const data = Object.fromEntries(PUBLIC_DATA_KEYS.map((key) => [key, source[key]]));

            return resp.status(200).json({
                success: true,
                message: result.message,
                data,
            });
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { RecalculatePublicProposalController };
