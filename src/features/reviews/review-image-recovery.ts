import type { ReviewImage } from "@/lib/api/types";
import type { DraftImage } from "./ReviewImagesEditor/ReviewImagesEditor";
import {
  hashReviewImageFile,
  type PendingNewItem,
  type RecoverableImageSync,
} from "./pending-image-sync";

export type RecoveryDraftResult =
  | { ready: true; items: DraftImage[] }
  | {
      ready: false;
      missingClientIds: string[];
      invalidClientIds: string[];
      missingImageIds: number[];
    };
export async function verifyRecoveryFile(item: PendingNewItem, file: File): Promise<boolean> {
  return (
    item.fileSize === file.size &&
    item.fileType === file.type &&
    item.sha256 === (await hashReviewImageFile(file))
  );
}
export async function rebuildRecoveryDraft(
  pending: RecoverableImageSync,
  files: ReadonlyMap<string, File>,
  images: readonly ReviewImage[],
  legacyStatusConfirmed: boolean,
): Promise<RecoveryDraftResult> {
  const items: DraftImage[] = [];
  const missingClientIds: string[] = [],
    invalidClientIds: string[] = [],
    missingImageIds: number[] = [];
  for (const item of pending.items) {
    if (item.kind === "existing") {
      const image = images.find((candidate) => candidate.id === item.imageId);
      if (image) items.push({ kind: "existing", clientId: item.clientId, image });
      else missingImageIds.push(item.imageId);
      continue;
    }
    const file = files.get(item.clientId);
    if (!file) {
      missingClientIds.push(item.clientId);
      continue;
    }
    const valid =
      "sha256" in item
        ? await verifyRecoveryFile(item, file)
        : legacyStatusConfirmed && item.fileSize === file.size && item.fileType === file.type;
    if (valid) items.push({ kind: "new", clientId: item.clientId, file, url: "" });
    else invalidClientIds.push(item.clientId);
  }
  return missingClientIds.length || invalidClientIds.length || missingImageIds.length
    ? { ready: false, missingClientIds, invalidClientIds, missingImageIds }
    : { ready: true, items };
}
