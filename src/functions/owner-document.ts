import { CompanySize, OwnerPersonType } from "@prisma/client";
import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";

export const OWNER_COMPANY_REQUIRED = "Informe a razão social e o CNPJ da empresa.";
export const OWNER_CNPJ_FORMAT = "Informe um CNPJ com 12 letras ou números e 2 dígitos no final.";

/** CNPJ numerico ou alfanumerico (IN RFB 2.229/2024): 12 letras ou digitos e 2 digitos verificadores. */
export const CNPJ_FORMAT = /^[A-Z0-9]{12}\d{2}$/;

export interface OwnerDocumentFields {
    personType: OwnerPersonType;
    companyName: string | null;
    cnpj: string | null;
    companySize: CompanySize | null;
}

export interface OwnerDocumentPatch {
    personType?: OwnerPersonType;
    companyName?: string | null;
    cnpj?: string | null;
    companySize?: CompanySize | null;
}

export function normalizeCnpj(raw: string): string {
    return raw.replace(/[.\/\-\s]/g, "").toUpperCase();
}

export function isCnpjFormat(raw: string): boolean {
    return CNPJ_FORMAT.test(normalizeCnpj(raw));
}

/** `current` e o registro gravado (null na criacao); campo ausente no `patch` preserva o gravado. */
export function resolveOwnerData(current: OwnerDocumentFields | null, patch: OwnerDocumentPatch): OwnerDocumentFields {
    const personType = patch.personType ?? current?.personType ?? "PF";

    if (personType === "PF") {
        return { personType, companyName: null, cnpj: null, companySize: null };
    }

    const companyName = (patch.companyName !== undefined ? patch.companyName : current?.companyName)?.trim();
    const rawCnpj = patch.cnpj !== undefined ? patch.cnpj : current?.cnpj;
    const companySize = patch.companySize !== undefined ? patch.companySize : current?.companySize ?? null;

    if (!companyName || !rawCnpj?.trim()) {
        throw new HttpBadRequestError(OWNER_COMPANY_REQUIRED);
    }

    const cnpj = normalizeCnpj(rawCnpj);
    if (!CNPJ_FORMAT.test(cnpj)) {
        throw new HttpBadRequestError(OWNER_CNPJ_FORMAT);
    }

    return { personType, companyName, cnpj, companySize };
}
