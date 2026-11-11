import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { getByIdProposalSchema } from "../../../zod/proposal/get-by-id-proposal-params-schema";
import { updatePublicProposalServicesBodySchema } from "../../../zod/proposal/update-public-proposal-services-schema";
import { UpdatePublicProposalServicesUseCase } from "./use-case-update-public-proposal-services";

const SERVICE_KEYS = ["name", "rpaRequired", "rpaMinPeople"] as const;

class UpdatePublicProposalServicesController {
    constructor(private updatePublicProposalServicesUseCase: UpdatePublicProposalServicesUseCase) { }

    async list(req: Request, resp: Response) {
        try {
            const { proposalId } = getByIdProposalSchema.parse(req.params);
            const result = await this.updatePublicProposalServicesUseCase.list(proposalId);
            const services = (result.data.services ?? []).map((service) => ({
                id: service.id,
                name: service.name,
                amount: service.amount,
                required: service.required,
                minPeople: service.minPeople,
                selected: service.selected,
                hourly: service.hourly === true,
                hours: typeof service.hours === "number" ? service.hours : null,
                courtesyQuantity: service.courtesyQuantity,
                courtesyAmount: service.courtesyAmount,
            }));

            return resp.status(200).json({
                success: true,
                message: result.message,
                data: { services },
            });
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }

    async update(req: Request, resp: Response) {
        try {
            const { proposalId } = getByIdProposalSchema.parse(req.params);
            const body = updatePublicProposalServicesBodySchema.parse(req.body);
            const result = await this.updatePublicProposalServicesUseCase.execute({
                proposalId,
                serviceIds: body.serviceIds,
                ...(body.serviceHours ? { serviceHours: body.serviceHours } : {}),
            });

            return resp.status(200).json({
                success: true,
                message: result.message,
                data: {
                    id: result.data.id,
                    totalAmount: result.data.totalAmount,
                    proposalServices: result.data.proposalServices.map(publicLine),
                },
            });
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

function publicLine(line: {
    id: string;
    serviceId: string;
    amount: number;
    courtesyQuantity: number;
    courtesyAmount: number;
    service: { name: string; rpaRequired: boolean; rpaMinPeople: number | null };
}) {
    const source = line.service as Record<string, unknown>;
    return {
        id: line.id,
        serviceId: line.serviceId,
        amount: line.amount,
        courtesyQuantity: line.courtesyQuantity,
        courtesyAmount: line.courtesyAmount,
        service: Object.fromEntries(SERVICE_KEYS.map((key) => [key, source[key]])),
    };
}

export { UpdatePublicProposalServicesController };
