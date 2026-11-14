import { Prisma, PrismaClient, Proposal } from "@prisma/client"
import { EventProfileReportRow, LeadTimeReportRow, ListProposalDbQuery, ProposalListDailyBucket, ProposalListRow, ReportProposalWhere, ServiceAdherenceReportRow } from "../interface/proposal-repository-interface";
import { UpdateProposalInDbParam } from "../../zod/proposal/update-proposal-in-db-params-schema";
import { CreateProposalInDbParams, ImageChoiceUpdate, MonthlyRevenueAnalysisParams, MonthProposalDataCount, ProposalPresentationRecord, ProposalRepositoryInterface, ProposalWithRelations, TrafegoCountResponse, TrafficSourceTypes, UpdateProposalServices, VenueImagesForChoice, VenueImagesForReorder } from "../interface/proposal-repository-interface"
import { GetTrafficCountVenueDbSchema } from "../../zod/venue/get-venue-traffic-count-db-schema";
import { GetVenueAnalysisByMonthDbSchema } from "../../zod/venue/get-venue-analysis-by-month-db-schema";
import { UpdatePersonalInfoProposalSchema } from "../../zod/proposal/update-personal-info-proposal-params-schema";
import { sortImagePositionUpdates } from "../../functions/plan-visible-image-positions";
import { ServiceQuoteLine } from "../../functions/quote-service-lines";
import { MonthlyAverageProposal, yearsProposalWhere } from "../../functions/monthly-average-by-years";
import { revenueEventWhere, revenueYears } from "../../functions/same-month-revenue-by-year";
import { reportYearRange } from "../../functions/report-year-range";
import { eventCategoryCounts } from "../../functions/event-category";
export class PrismaProposalRepository implements ProposalRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async createPerPerson(params: CreateProposalInDbParams): Promise<Proposal | null> {

    const { serviceIds, serviceLines, venueId, ...rest } = params

    const x = await this.prisma.proposal.create({
      data: {
        ...rest,
        venue: {
          connect: {
            id: venueId
          }
        },
        proposalServices: {
          createMany: {
            data: serviceLineRows(serviceLines, serviceIds),
          },
        },
      },
    });


    return x
  }

  async createPerDay(params: CreateProposalInDbParams): Promise<Proposal | null> {

    const { serviceIds, serviceLines, ...rest } = params

    return await this.prisma.proposal.create({
      data: {
        ...rest,
        proposalServices: {
          createMany: {
            data: serviceLineRows(serviceLines, serviceIds),
          },
        },
      },
    });
  }

  async update(reference: UpdateProposalInDbParam): Promise<Proposal | null> {
    const { serviceIds, serviceLines, ...rest } = reference.data
    if (serviceLines) {
      return await this.prisma.proposal.update({
        where: { id: reference.proposalId },
        data: {
          ...rest,
          proposalServices: {
            deleteMany: {},
            create: serviceLineRows(serviceLines, serviceIds),
          },
        },
      })
    }
    const currentServices = await this.prisma.proposal.findUnique({
      where: { id: reference.proposalId },
      include: {
        proposalServices: {
          select: { serviceId: true },
        },
      },
    });

    const services = reference.data.serviceIds
    const currentOwnerIds = currentServices?.proposalServices.map((relation) => relation.serviceId) || [];

    const ownersToConnect = services?.filter((id) => !currentOwnerIds.includes(id)) || [];
    const ownersToDisconnect = currentOwnerIds.filter((id) => !services?.includes(id)) || [];

    return await this.prisma.proposal.update({
      where: {
        id: reference.proposalId
      },
      data: {
        ...rest,
        proposalServices: {
          create: ownersToConnect.map((serviceId) => ({
            service: { connect: { id: serviceId } }, // Relaciona o owner
          })),
          deleteMany: ownersToDisconnect.map((serviceId) => ({
            serviceId,
            proposalId: reference.proposalId
          })),
        },
      }
    })
  }

  async updateServices({ serviceIds, serviceLines, proposalId }: UpdateProposalServices): Promise<Proposal | null> {
    if (serviceLines) {
      return await this.prisma.proposal.update({
        where: { id: proposalId },
        data: {
          proposalServices: {
            deleteMany: {},
            create: serviceLineRows(serviceLines, serviceIds),
          },
        },
      })
    }
    const currentServices = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        proposalServices: {
          select: { serviceId: true },
        },
      },
    });

    const services = serviceIds
    const currentOwnerIds = currentServices?.proposalServices.map((relation) => relation.serviceId) || [];

    const ownersToConnect = services?.filter((id) => !currentOwnerIds.includes(id)) || [];
    const ownersToDisconnect = currentOwnerIds.filter((id) => !services?.includes(id)) || [];

    return await this.prisma.proposal.update({
      where: {
        id: proposalId
      },
      data: {
        proposalServices: {
          create: ownersToConnect.map((serviceId) => ({
            service: { connect: { id: serviceId } }, // Relaciona o owner
          })),
          deleteMany: ownersToDisconnect.map((serviceId) => ({
            serviceId,
            proposalId: proposalId
          })),
        },
      }
    })
  }

  async trafficCount({ year, venueId, approved }: GetTrafficCountVenueDbSchema): Promise<TrafegoCountResponse | null> {
    const where = {
      venueId,
      ...(approved && {
        approved: true,
      }),
      startDate: reportYearRange(year),
    };
    const [trafegoCounts, categoryCounts] = await Promise.all([
      this.prisma.proposal.groupBy({
        by: ["trafficSource"],
        _count: {
          trafficSource: true,
        },
        where,
      }),
      this.prisma.proposal.groupBy({
        by: ["eventCategory"],
        _count: {
          _all: true,
        },
        where,
      }),
    ]);

    const proposalAccount = trafegoCounts.reduce(
      (acc, curr) => acc + curr._count.trafficSource,
      0
    );

    const trafficData = {
      all: proposalAccount,
      google:
        trafegoCounts.find((item) => item.trafficSource === "GOOGLE")?._count
          .trafficSource || 0,
      instagram:
        trafegoCounts.find((item) => item.trafficSource === "INSTAGRAM")?._count
          .trafficSource || 0,
      tikTok:
        trafegoCounts.find((item) => item.trafficSource === "TIKTOK")?._count
          .trafficSource || 0,
      facebook:
        trafegoCounts.find((item) => item.trafficSource === "FACEBOOK")?._count
          .trafficSource || 0,
      friend:
        trafegoCounts.find((item) => item.trafficSource === "FRIEND")?._count
          .trafficSource || 0,
      other:
        trafegoCounts.find((item) => item.trafficSource === "OTHER")?._count
          .trafficSource || 0,
      airbnb:
        trafegoCounts.find((item) => item.trafficSource === "AIRBNB")?._count
          .trafficSource || 0,
    };

    // Criar lista apenas com as fontes de tráfego (excluindo "all")
    const trafegoList = Object.keys(trafficData)
      .filter(key => key !== "all") // Excluir o campo "all"
      .map((key) => ({
        name: key,
        count: trafficData[key as keyof TrafficSourceTypes],
      }));

    // Ordenando baseado no valor de cada fonte
    const sortedSources = trafegoList.sort(
      (a, b) => b.count - a.count
    );

    const categories = eventCategoryCounts(
      categoryCounts.map((item) => ({ eventCategory: item.eventCategory, count: item._count._all }))
    );

    return { all: trafficData.all, sortedSources, categories };
  }


  async getById(reference: string): Promise<ProposalWithRelations | null> {
    return await this.prisma.proposal.findUnique({
      where: {
        id: reference
      },
      include: {
        proposalServices: {
          include: {
            service: true
          }
        },
        histories: {
          orderBy: {
            createdAt: "asc"
          }
        },
        payments: {
          orderBy: {
            createdAt: "asc"
          }
        },
        personList: {
          orderBy: {
            name: "asc"
          }
        },
      }
    })
  }

  async getPresentation(proposalId: string): Promise<ProposalPresentationRecord | null> {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      select: {
        venue: {
          select: {
            id: true,
            name: true,
            description: true,
            logoUrl: true,
            city: true,
            state: true,
            neighborhood: true,
            street: true,
            streetNumber: true,
            maxGuest: true,
            hasOvernightStay: true,
            checkIn: true,
            checkOut: true,
            minimumNights: true,
            openingHour: true,
            closingHour: true,
            url: true,
            instagramUrl: true,
            facebookUrl: true,
            tiktokUrl: true,
            tourVideoUrl: true,
            whatsappNumber: true,
            proposalPrimaryColor: true,
            proposalSecondaryColor: true,
            proposalTextColor: true,
            images: {
              where: { isShowOnProposal: true },
              select: {
                id: true,
                imageUrl: true,
                description: true,
                position: true,
              },
              orderBy: [{ position: "asc" }, { id: "asc" }],
            },
            amenities: {
              select: {
                name: true,
                position: true,
                description: true,
                videoUrl: true,
                images: {
                  select: { imageUrl: true },
                  orderBy: [{ position: "asc" }, { createdAt: "asc" }],
                },
              },
              orderBy: [{ position: "asc" }, { createdAt: "asc" }],
            },
          },
        },
      },
    });

    if (!proposal?.venue) {
      return null;
    }

    const venue = proposal.venue;
    return {
      venueId: venue.id,
      name: venue.name,
      description: venue.description,
      logoUrl: venue.logoUrl,
      city: venue.city,
      state: venue.state,
      neighborhood: venue.neighborhood,
      street: venue.street,
      streetNumber: venue.streetNumber,
      maxGuest: venue.maxGuest,
      hasOvernightStay: venue.hasOvernightStay,
      checkIn: venue.checkIn,
      checkOut: venue.checkOut,
      minimumNights: venue.minimumNights,
      openingHour: venue.openingHour,
      closingHour: venue.closingHour,
      url: venue.url,
      instagramUrl: venue.instagramUrl,
      facebookUrl: venue.facebookUrl,
      tiktokUrl: venue.tiktokUrl,
      tourVideoUrl: venue.tourVideoUrl,
      whatsappNumber: venue.whatsappNumber,
      proposalPrimaryColor: venue.proposalPrimaryColor,
      proposalSecondaryColor: venue.proposalSecondaryColor,
      proposalTextColor: venue.proposalTextColor,
      images: venue.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        description: image.description,
        position: image.position,
      })),
      amenities: venue.amenities.map((amenity) => {
        const images = amenity.images.map((image) => image.imageUrl);
        return {
          name: amenity.name,
          position: amenity.position,
          description: amenity.description,
          images,
          imageUrl: images[0] ?? null,
          videoUrl: amenity.videoUrl,
        };
      }),
    };
  }

  async listVenueImagesForReorder(proposalId: string): Promise<VenueImagesForReorder | null> {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      select: {
        venue: {
          select: {
            id: true,
            images: {
              select: {
                id: true,
                imageUrl: true,
                description: true,
                position: true,
                isShowOnProposal: true,
              },
            },
          },
        },
      },
    });

    if (!proposal?.venue) {
      return null;
    }

    const visible = proposal.venue.images
      .filter((image) => image.isShowOnProposal === true)
      .map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        description: image.description,
        position: image.position,
      }))
      .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
    const hiddenPositions = proposal.venue.images
      .filter((image) => image.isShowOnProposal !== true)
      .map((image) => image.position);

    return {
      venueId: proposal.venue.id,
      visible,
      hiddenPositions,
    };
  }

  async applyImagePositions(updates: { id: string; position: number }[]): Promise<void> {
    const ordered = sortImagePositionUpdates(updates);
    await this.prisma.$transaction(
      ordered.map((item: { id: string; position: number }) =>
        this.prisma.image.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );
  }

  async listVenueImageCatalog(proposalId: string): Promise<VenueImagesForChoice | null> {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      select: {
        venue: {
          select: {
            id: true,
            images: {
              select: {
                id: true,
                imageUrl: true,
                description: true,
                position: true,
                isShowOnProposal: true,
              },
            },
          },
        },
      },
    });

    if (!proposal?.venue) {
      return null;
    }

    return {
      venueId: proposal.venue.id,
      images: proposal.venue.images
        .map((image) => ({
          id: image.id,
          imageUrl: image.imageUrl,
          description: image.description,
          position: image.position,
          isShowOnProposal: image.isShowOnProposal === true,
        }))
        .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id)),
    };
  }

  async applyImageChoice(updates: ImageChoiceUpdate[]): Promise<void> {
    const ordered = [...updates].sort((left, right) => left.id.localeCompare(right.id));
    await this.prisma.$transaction(
      ordered.map((item) =>
        this.prisma.image.update({
          where: { id: item.id },
          data: {
            position: item.position,
            isShowOnProposal: item.isShowOnProposal,
          },
        })
      )
    );
  }

  async delete(reference: string): Promise<Proposal | null> {
    return await this.prisma.proposal.delete({
      where: {
        id: reference
      }
    })
  }

  async updatePersonalInfo({ proposalId, data }: UpdatePersonalInfoProposalSchema): Promise<Proposal | null> {
    const { cep, cpf, city, completeClientName, completeCompanyName, neighborhood, state, street, streetNumber, rg, cnpj, adressComplement, email } = data
    return await this.prisma.proposal.update({
      where: {
        id: proposalId
      },
      data: {
        cpf,
        cep,
        city,
        state,
        cnpj,
        street,
        completeClientName,
        completeCompanyName,
        email,
        streetNumber,
        neighborhood,
        adressComplement,
        rg: rg ?? null,
      } as Prisma.ProposalUpdateInput,
    })
  }

  async list(query: ListProposalDbQuery): Promise<{ items: ProposalListRow[]; total: number }> {
    const where = {
      venueId: query.venueId,
      ...(query.email && {
        email: { contains: query.email },
      }),
      ...(query.completeClientName && {
        completeClientName: { contains: query.completeClientName },
      }),
      ...(query.whatsapp && {
        OR: whatsappTerms(query.whatsapp).map((term) => ({ whatsapp: { contains: term } })),
      }),
      ...(query.approved !== undefined && { approved: query.approved }),
      ...(query.minAmount !== undefined && { totalAmount: { gte: query.minAmount } }),
      ...(query.range && {
        startDate: { gte: query.range.gte, lt: query.range.lt },
      }),
    };
    const orderField = query.sortBy === "status" ? "approved" : query.sortBy;
    const orderBy = [{ [orderField]: query.sortDir }, { id: "asc" as const }];
    const select = {
      id: true,
      completeClientName: true,
      email: true,
      endDate: true,
      startDate: true,
      totalAmount: true,
      approved: true,
    };

    if (query.take === undefined) {
      const items = await this.prisma.proposal.findMany({ where, select, orderBy });
      return { items, total: items.length };
    }

    const [total, items] = await Promise.all([
      this.prisma.proposal.count({ where }),
      this.prisma.proposal.findMany({
        where,
        select,
        orderBy,
        skip: query.skip ?? 0,
        take: query.take,
      }),
    ]);

    return { items, total };
  }

  async summarize(query: ListProposalDbQuery): Promise<ProposalListDailyBucket[]> {
    // startDate e DATETIME. DATE_FORMAT le o calendario gravado, que e o wall-clock.
    const filters: Prisma.Sql[] = [Prisma.sql`venueId = ${query.venueId}`];
    if (query.range) {
      filters.push(Prisma.sql`startDate >= ${query.range.gte}`);
      filters.push(Prisma.sql`startDate < ${query.range.lt}`);
    }
    if (query.approved !== undefined) {
      filters.push(Prisma.sql`approved = ${query.approved}`);
    }
    if (query.minAmount !== undefined) {
      filters.push(Prisma.sql`totalAmount >= ${query.minAmount}`);
    }
    if (query.completeClientName) {
      filters.push(Prisma.sql`completeClientName LIKE ${containsLike(query.completeClientName)}`);
    }
    if (query.email) {
      filters.push(Prisma.sql`email LIKE ${containsLike(query.email)}`);
    }
    if (query.whatsapp) {
      const likes = whatsappTerms(query.whatsapp).map((term) => Prisma.sql`whatsapp LIKE ${containsLike(term)}`);
      filters.push(Prisma.sql`(${Prisma.join(likes, " OR ")})`);
    }

    const rows = await this.prisma.$queryRaw<Array<{ day: string; count: bigint; amount: number | null; approved: bigint | number | null }>>(Prisma.sql`
      SELECT DATE_FORMAT(\`startDate\`, '%Y-%m-%d') AS day,
             COUNT(*) AS count,
             COALESCE(SUM(\`totalAmount\`), 0) AS amount,
             COALESCE(SUM(\`approved\`), 0) AS approved
      FROM \`proposal\`
      WHERE ${Prisma.join(filters, " AND ")}
      GROUP BY DATE_FORMAT(\`startDate\`, '%Y-%m-%d')
    `);

    return rows.map((row) => ({
      day: String(row.day).slice(0, 10),
      count: Number(row.count),
      amount: Number(row.amount ?? 0),
      approved: Number(row.approved ?? 0),
    }));
  }

  async summarizeWindow(query: { venueId: string; range?: { gte: Date; lt: Date } }) {
    const filters: Prisma.Sql[] = [Prisma.sql`venueId = ${query.venueId}`];
    if (query.range) {
      filters.push(Prisma.sql`startDate >= ${query.range.gte}`);
      filters.push(Prisma.sql`startDate < ${query.range.lt}`);
    }

    const rows = await this.prisma.$queryRaw<Array<{ day: string; amount: number | null; maxAmount: number | null }>>(Prisma.sql`
      SELECT DATE_FORMAT(\`startDate\`, '%Y-%m-%d') AS day,
             COALESCE(SUM(CASE WHEN \`approved\` = 1 THEN \`totalAmount\` ELSE 0 END), 0) AS amount,
             COALESCE(MAX(\`totalAmount\`), 0) AS maxAmount
      FROM \`proposal\`
      WHERE ${Prisma.join(filters, " AND ")}
      GROUP BY DATE_FORMAT(\`startDate\`, '%Y-%m-%d')
    `);

    return rows.map((row) => ({
      day: String(row.day).slice(0, 10),
      amount: Number(row.amount ?? 0),
      maxAmount: Number(row.maxAmount ?? 0),
    }));
  }

  async analysisByMonth({ year, venueId, approved }: GetVenueAnalysisByMonthDbSchema): Promise<any> {
    return await this.prisma.proposal.findMany({
      where: {
        venueId,
        ...(approved && {
          approved: true,
        }),
        startDate: reportYearRange(year),
      },
      select: {
        totalAmount: true,
        startDate: true,
        trafficSource: true,
        guestNumber: true,
        approved: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });
  }

  async revenueYearsProposals(venueId: string): Promise<{ years: number[]; proposals: MonthlyAverageProposal[] }> {
    const revenueEvents = await this.prisma.dateEvent.findMany({
      where: revenueEventWhere(venueId),
      select: {
        startDate: true,
        proposal: { select: { totalAmount: true } },
      },
    });
    const years = revenueYears(
      revenueEvents.map((event) => ({
        startDate: event.startDate,
        totalAmount: event.proposal?.totalAmount ?? null,
      }))
    );
    if (years.length === 0) return { years, proposals: [] };

    const proposals = await this.prisma.proposal.findMany({
      where: yearsProposalWhere(venueId, years),
      select: { startDate: true, approved: true },
    });
    return { years, proposals };
  }

  async monthlyRevenueAnalysis({ year, month, venueId, approved }: MonthlyRevenueAnalysisParams): Promise<number> {
    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);

    const proposals = await this.prisma.proposal.findMany({
      where: {
        venueId,
        ...(approved && { approved: true }),
        startDate: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      select: {
        totalAmount: true,
      },
    });
  
    const totalAmount = proposals.reduce((acc, proposal) => acc + proposal.totalAmount, 0);

    return totalAmount

  }

  async leadTimeRows(where: ReportProposalWhere): Promise<LeadTimeReportRow[]> {
    return await this.prisma.proposal.findMany({
      where,
      select: { createdAt: true, startDate: true, approved: true },
    });
  }

  async serviceAdherenceRows(where: ReportProposalWhere): Promise<ServiceAdherenceReportRow[]> {
    return await this.prisma.proposal.findMany({
      where,
      select: {
        id: true,
        proposalServices: {
          select: { serviceId: true, amount: true, service: { select: { name: true } } },
        },
      },
    });
  }

  async eventProfileRows(where: ReportProposalWhere): Promise<EventProfileReportRow[]> {
    return await this.prisma.proposal.findMany({
      where,
      select: { guestNumber: true, eventCategory: true },
    });
  }
}

function containsLike(value: string): string {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

// O whatsapp da proposta e gravado ora com mascara "(11) 99999-8888", ora so com digitos.
function whatsappTerms(value: string): string[] {
  const digits = value.replace(/\D/g, "");
  return digits && digits !== value ? [value, digits] : [value];
}

type StoredServiceLine = Omit<ServiceQuoteLine, "courtesyQuantity"> & { courtesyQuantity?: number };

function serviceLineRows(serviceLines: StoredServiceLine[] | undefined, serviceIds: string[] | undefined) {
  if (serviceLines) {
    return serviceLines.map((line) => ({
      serviceId: line.serviceId,
      pricingType: line.pricingType,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      courtesyQuantity: line.courtesyQuantity ?? 0,
      amount: line.amount,
    }))
  }
  return serviceIds?.map((serviceId) => ({ serviceId })) || []
}

