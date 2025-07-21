
import { handleErrors } from "../../../errors/error-handler";
import { UpdateVenuePaymentInfoSchemaDb, updateVenuePaymentInfoSchemaDb } from "../../../zod/venue/update-payment-info-venue-params-schema";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { UpdatePyamentInfoVenueUseCase } from "./use-case-update-payment-info-venue";
import { Request, Response } from "express";

class UpdateVenuePaymentInfoController {
    constructor(
        private updateVenuePaymentInfoUseCase: UpdatePyamentInfoVenueUseCase,
        private venueRepository: VenueRepositoryInterface
    ) { }

    async handle(req: Request, resp: Response) {
        try {
            const param = updateVenuePaymentInfoSchemaDb.parse(req.body);
            const { venueId, userId, data } : UpdateVenuePaymentInfoSchemaDb = param ;

            const response = await this.updateVenuePaymentInfoUseCase.execute({
                venueId,
                userId,
                data: {
                    pricePerDay: data.pricePerDay,
                    pricingModel: data.pricingModel,
                    pricePerPerson: data.pricePerPerson,
                    pricePerPersonDay: data.pricePerPersonDay,
                    pricePerPersonHour: data.pricePerPersonHour,
                }
            });
            return resp.status(201).json(response);
        } catch (error) {
            console.log("error", error)
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateVenuePaymentInfoController }
