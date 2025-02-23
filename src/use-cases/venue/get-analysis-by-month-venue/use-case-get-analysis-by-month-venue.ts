
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { GetVenueAnalysisByMonthSchema } from "../../../zod/venue/get-venue-analysis-by-month-params-schema";


class GetVenueAnalysisByMonthUseCase {
    constructor(
        private venueRepository: VenueRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface
    ) { }

    async execute({ venueId, year, approved }: GetVenueAnalysisByMonthSchema) {
        // Validate if venue exists
        const venue = await this.venueRepository.getById({ venueId })

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao")
        }
        //

        const reponse = await this.proposalRepository.analysisByMonth({
            venueId,
            year: Number(year),
            approved: !!approved
        })

        if (!reponse) {
            return new HttpResourceNotFoundError("Orcamento")
        }

        const months = [
            "jan.",
            "fev.",
            "mar.",
            "abr.",
            "mai.",
            "jun.",
            "jul.",
            "ago.",
            "set.",
            "out.",
            "nov.",
            "dez.",
        ];

        const resultProposalByMonth = months.reduce((acc, month) => {
            acc[month] = {
                month: `${month}`,
                count: 0,
                total: 0,
                guestNumber: 0,
            };
            return acc;
        }, {} as Record<string, typeof monthProposalData>);

        const resultEventsByMonth = months.reduce((acc, month) => {
            acc[month] = {
                month: `${month}`,
                count: 0,
                total: 0,
                guestNumber: 0,
            };
            return acc;
        }, {} as Record<string, typeof monthProposalData>);

        const monthProposalData = {
            month: "Total Absoluto",
            count: 0,
            total: 0,
            guestNumber: 0,
        };

        const allProposalData = {
            count: 0,
            total: 0,
            guestNumber: 0,
        };

        const allApprovedData = {
            count: 0,
            total: 0,
            guestNumber: 0,
        };

        reponse.forEach((proposal) => {
            const month = new Date(proposal.startDate)
                .toLocaleString("pt-BR", { month: "short" })
                .toLowerCase();

            if (proposal?.approved) {
                allApprovedData.count += 1;
                allApprovedData.total += proposal.totalAmount;
                allApprovedData.guestNumber += proposal.guestNumber;

                resultEventsByMonth[month].count += 1;
                resultEventsByMonth[month].total += proposal.totalAmount;
                resultEventsByMonth[month].guestNumber += proposal.guestNumber;
            }

            resultProposalByMonth[month].count += 1;
            resultProposalByMonth[month].total += proposal.totalAmount;
            resultProposalByMonth[month].guestNumber += proposal.guestNumber;

            // Atualiza os totais absolutos corretamente (sem usar [month])
            allProposalData.count += 1;
            allProposalData.total += proposal.totalAmount;
            allProposalData.guestNumber += proposal.guestNumber;
        });

        const resultTotalArray = allProposalData;
        const resultEventsByMonthArray = Object.values(resultEventsByMonth);
        const resultProposalByMonthArray = Object.values(resultProposalByMonth);

        
        const formatedResponse = {
            success: true,
            message: `Sucesso`,
            data: {
                total: resultTotalArray,
                approved: allApprovedData,
                analysisEventsByMonth: resultEventsByMonthArray,
                analysisProposalByMonth: resultProposalByMonthArray,
            },
            count: 1,
            type: "Analysis By Month"
        }

        return formatedResponse
    }
}

export { GetVenueAnalysisByMonthUseCase }
