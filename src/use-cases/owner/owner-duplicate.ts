import { HttpConflictError } from "../../errors/errors-type/htttp-conflict-error";
import { OwnerDocumentFields } from "../../functions/owner-document";
import { OwnerRepositoryInterface } from "../../repositories/interface/owner-repository-interface";

interface OwnerDuplicateCheck {
    organizationId: string;
    resolved: OwnerDocumentFields;
    /** So na criacao: a edicao de PF nao checa nome. */
    completeName?: string;
    excludeOwnerId?: string;
}

export async function assertOwnerNotDuplicated(
    repository: Pick<OwnerRepositoryInterface, "findDuplicate">,
    { organizationId, resolved, completeName, excludeOwnerId }: OwnerDuplicateCheck,
) {
    if (resolved.personType === "PJ" && resolved.cnpj) {
        if (await repository.findDuplicate({ organizationId, cnpj: resolved.cnpj, excludeOwnerId })) {
            throw new HttpConflictError("Proprietario com este CNPJ");
        }
        return;
    }

    if (completeName !== undefined && (await repository.findDuplicate({ organizationId, completeName, excludeOwnerId }))) {
        throw new HttpConflictError("Proprietario");
    }
}
