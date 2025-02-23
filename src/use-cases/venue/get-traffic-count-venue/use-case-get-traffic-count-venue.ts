import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { GetTrafficCountVenueSchema } from "../../../zod/venue/get-venue-traffic-count-params-schema";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";

class GetVenueTrafficCountUseCase {
    constructor(
        private venueRepository: VenueRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface
    ) { }

    async execute({venueId,year,approved}: GetTrafficCountVenueSchema) {
        // Validate if venue exists
        const venue = await this.venueRepository.getById({venueId})

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao")
        }
        //

        const trafficCount = await this.proposalRepository.trafficCount({
            venueId,
            year: Number(year),
            approved: !!approved
        })

        const formatedResponse = {
            success: true,
            message: `Sucesso`,
            data: {
                ...trafficCount
            },
            count: 1,
            type: "Traffic Data"
        }

        return formatedResponse
    }
}

export { GetVenueTrafficCountUseCase }
