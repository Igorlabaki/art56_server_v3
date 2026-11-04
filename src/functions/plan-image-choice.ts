import { ProposalImageCatalogItem, ProposalPresentationImage, ImageChoiceUpdate } from "../repositories/interface/proposal-repository-interface";

export type PlannedImageChoice =
    | { ok: true; changed: false; images: ProposalPresentationImage[]; catalog: ProposalImageCatalogItem[] }
    | { ok: true; changed: true; images: ProposalPresentationImage[]; catalog: ProposalImageCatalogItem[]; updates: ImageChoiceUpdate[] }
    | { ok: false };

function byPosition(left: { position: number; id: string }, right: { position: number; id: string }) {
    return left.position - right.position || left.id.localeCompare(right.id);
}

function visibleImages(images: ProposalImageCatalogItem[]): ProposalPresentationImage[] {
    return images
        .filter((image) => image.isShowOnProposal)
        .sort(byPosition)
        .map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
            description: image.description,
            position: image.position,
        }));
}

export function planImageChoice(
    images: ProposalImageCatalogItem[],
    slotId: string,
    replacementId: string
): PlannedImageChoice {
    const slot = images.find((image) => image.id === slotId);
    const replacement = images.find((image) => image.id === replacementId);
    if (!slot || !replacement || slot.isShowOnProposal !== true) {
        return { ok: false };
    }

    const catalog = [...images].sort(byPosition);
    if (slotId === replacementId) {
        return { ok: true, changed: false, images: visibleImages(catalog), catalog };
    }

    const next = catalog.map((image) => ({ ...image }));
    const nextSlot = next.find((image) => image.id === slotId)!;
    const nextReplacement = next.find((image) => image.id === replacementId)!;
    const slotPosition = nextSlot.position;
    nextSlot.position = nextReplacement.position;
    nextReplacement.position = slotPosition;
    if (!nextReplacement.isShowOnProposal) {
        nextSlot.isShowOnProposal = false;
        nextReplacement.isShowOnProposal = true;
    }

    return {
        ok: true,
        changed: true,
        images: visibleImages(next),
        catalog: [...next].sort(byPosition),
        updates: [nextSlot, nextReplacement]
            .map((image) => ({
                id: image.id,
                position: image.position,
                isShowOnProposal: image.isShowOnProposal,
            }))
            .sort((left, right) => left.id.localeCompare(right.id)),
    };
}
