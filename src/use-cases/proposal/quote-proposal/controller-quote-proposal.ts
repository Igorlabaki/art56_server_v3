import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { quoteProposalBodySchema } from "../../../zod/proposal/quote-proposal-schema";
import { QuoteProposalUseCase } from "./use-case-quote-proposal";

const QUOTE_DATA_KEYS = [
    "basePrice",
    "extraHoursQty",
    "extraHourPrice",
    "totalAmountService",
    "totalAmount",
    "minimumApplied",
] as const;

class QuoteProposalController {
    constructor(private quoteProposalUseCase: Pick<QuoteProposalUseCase, "execute">) { }

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const body = quoteProposalBodySchema.parse(req.body);
            const result = await this.quoteProposalUseCase.execute({ ...body, userId: req.user?.id });

            const source = result.data as Record<string, unknown>;
            const data = Object.fromEntries(QUOTE_DATA_KEYS.map((key) => [key, source[key]]));

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

export { QuoteProposalController };
