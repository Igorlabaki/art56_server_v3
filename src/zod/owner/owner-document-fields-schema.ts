import { CompanySize, OwnerPersonType } from "@prisma/client";
import { z } from "zod";

/** Campos de PF/PJ; a regra entre eles fica em `resolveOwnerData`. */
export const ownerDocumentFieldsSchema = {
    personType: z.nativeEnum(OwnerPersonType).optional(),
    companyName: z.string().nullable().optional(),
    cnpj: z.string().nullable().optional(),
    companySize: z.nativeEnum(CompanySize).nullable().optional(),
};
