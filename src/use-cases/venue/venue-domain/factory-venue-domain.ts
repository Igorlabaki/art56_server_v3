import { PrismaVenueDomainReadPermission, PrismaVenueDomainRepository } from "../../../repositories/in-prisma/venue-domain-in-prisma-repository";
import { PrismaVenueInfoEditPermission } from "../../../repositories/in-prisma/venue-link-in-prisma-repository";
import prismaClient from "../../../services/prisma-client";
import { DeleteVenueDomainController, GetVenueDomainController, ResolveVenueDomainController, SaveVenueDomainController, VerifyVenueDomainController } from "./controller-venue-domain";
import { DisabledVenueDomainRegistrar, VenueDomainRegistrar } from "./venue-domain-registrar";
import { DeleteVenueDomainUseCase, GetVenueDomainUseCase, ResolveVenueDomainUseCase, SaveVenueDomainUseCase, VerifyVenueDomainUseCase } from "./use-case-venue-domain";
import { readVercelDomainConfig, VercelVenueDomainRegistrar } from "./vercel-domain-registrar";

function registrar(): VenueDomainRegistrar {
    const config = readVercelDomainConfig();
    return config ? new VercelVenueDomainRegistrar(config) : new DisabledVenueDomainRegistrar();
}

export const resolveVenueDomainFactory = () => {
    const domains = new PrismaVenueDomainRepository(prismaClient);
    return new ResolveVenueDomainController(new ResolveVenueDomainUseCase(domains));
};

export const getVenueDomainFactory = () => {
    const domains = new PrismaVenueDomainRepository(prismaClient);
    const permission = new PrismaVenueDomainReadPermission(prismaClient);
    return new GetVenueDomainController(new GetVenueDomainUseCase(domains, permission));
};

export const saveVenueDomainFactory = () => {
    const domains = new PrismaVenueDomainRepository(prismaClient);
    const permission = new PrismaVenueInfoEditPermission(prismaClient);
    return new SaveVenueDomainController(new SaveVenueDomainUseCase(domains, permission, registrar()));
};

export const verifyVenueDomainFactory = () => {
    const domains = new PrismaVenueDomainRepository(prismaClient);
    const permission = new PrismaVenueInfoEditPermission(prismaClient);
    return new VerifyVenueDomainController(new VerifyVenueDomainUseCase(domains, permission, registrar()));
};

export const deleteVenueDomainFactory = () => {
    const domains = new PrismaVenueDomainRepository(prismaClient);
    const permission = new PrismaVenueInfoEditPermission(prismaClient);
    return new DeleteVenueDomainController(new DeleteVenueDomainUseCase(domains, permission, registrar()));
};
