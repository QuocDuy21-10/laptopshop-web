"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { Dialog } from "@/components/ui/Dialog/Dialog";
import { useMe } from "@/features/account/useMe";
import type { ReviewEligibility, ReviewImage, ReviewImageSyncResult } from "@/lib/api/types";
import { clearPendingImageSync, readPendingImageSync, savePendingImageSync, toPendingImageSync } from "../pending-image-sync";
import { useCreateReview, useDeleteReview, useReviewImageSyncStatus, useSyncReviewImages, useUpdateReview } from "../hooks";
import { ReviewForm } from "../ReviewForm/ReviewForm";
import type { ReviewImagesState } from "../ReviewImagesEditor/ReviewImagesEditor";
import type { ReviewInput } from "../schema";

type Props = { productId: number; productName: string; eligibility: ReviewEligibility; open: boolean; onOpenChange: (open: boolean) => void };
type SavePhase = "IDLE" | "SAVING_REVIEW" | "SYNCING_IMAGES" | "RECONCILING" | "COMPLETED" | "PARTIAL_SUCCESS" | "CONFLICT";

const newKey = () => (typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
const draftImages = (review: ReviewEligibility["existingReview"]): ReviewImagesState =>
  review?.images.map((image) => ({ kind: "existing", clientId: `existing-${image.id}`, image })) ?? [];
const resultImages = (result: ReviewImageSyncResult): ReviewImage[] =>
  result.images.map(({ clientId, ...image }) => { void clientId; return image; });

export function ReviewDialog({ productId, productName, eligibility, open, onOpenChange }: Props) {
  const me = useMe();
  const existing = eligibility.existingReview;
  const [activeReview, setActiveReview] = useState(existing);
  const [imageState, setImageState] = useState<ReviewImagesState>(() => draftImages(existing));
  const [imageError, setImageError] = useState<string | null>(null);
  const [phase, setPhase] = useState<SavePhase>("IDLE");
  const [syncKey, setSyncKey] = useState<string | null>(null);
  const lastTargetRef = useRef<number | null>(existing?.id ?? null);
  const create = useCreateReview(productId, me.data?.id);
  const update = useUpdateReview(productId, activeReview?.id ?? 0, me.data?.id);
  const remove = useDeleteReview(productId, activeReview?.id ?? 0, me.data?.id);
  const sync = useSyncReviewImages(productId, me.data?.id);
  const syncStatus = useReviewImageSyncStatus(activeReview?.id ?? 0, syncKey ?? undefined, phase === "RECONCILING");
  const busy = phase === "SAVING_REVIEW" || phase === "SYNCING_IMAGES";
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open || phase !== "IDLE") return;
    if (lastTargetRef.current !== existing?.id) {
      lastTargetRef.current = existing?.id ?? null;
      setActiveReview(existing);
      setImageState(draftImages(existing));
      setImageError(null);
      setSyncKey(null);
    }
    if (existing?.id) {
      const pending = readPendingImageSync(productId, existing.id);
      if (pending) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSyncKey(pending.idempotencyKey);
        setPhase("RECONCILING");
      }
    }
  }, [existing, open, phase, productId]);

  useEffect(() => {
    if (phase !== "RECONCILING") return;
    if (syncStatus.data?.status === "SUCCEEDED" && syncStatus.data.result) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveReview((current) => current ? { ...current, imageVersion: syncStatus.data!.result!.imageVersion, images: resultImages(syncStatus.data!.result!) } : current);
      setImageState(syncStatus.data.result.images.map((image) => ({ kind: "existing", clientId: `existing-${image.id}`, image })));
      clearPendingImageSync();
      setPhase("COMPLETED");
      onOpenChange(false);
    } else if (syncStatus.data?.status === "WAITING_RETRY") {
      setPhase("PARTIAL_SUCCESS");
      setImageError("Đánh giá đã lưu; ảnh đang chờ bạn thử lại cùng thao tác.");
    } else if (syncStatus.isError) {
      setPhase("CONFLICT");
      setImageError("Không thể xác định trạng thái đồng bộ ảnh; hãy tải lại dữ liệu trước khi thử lại.");
    }
  }, [onOpenChange, phase, syncStatus.data, syncStatus.isError]);

  const handleDraftChange = (next: ReviewImagesState) => {
    setImageState(next);
    if (phase === "PARTIAL_SUCCESS" || phase === "CONFLICT") setSyncKey(null);
  };

  const submit = async (input: ReviewInput) => {
    setImageError(null);
    setPhase("SAVING_REVIEW");
    let syncStarted = false;
    try {
      const response = activeReview ? await update.mutateAsync(input) : await create.mutateAsync(input);
      const saved = response.data;
      setActiveReview(saved);
      if (!imageState.length && !saved.images.length) {
        clearPendingImageSync();
        setPhase("COMPLETED");
        onOpenChange(false);
        return;
      }
      const key = syncKey ?? newKey();
      setSyncKey(key);
      savePendingImageSync(toPendingImageSync(productId, saved.id, saved.imageVersion, key, imageState));
      setPhase("SYNCING_IMAGES");
      syncStarted = true;
      const result = await sync.mutateAsync({ reviewId: saved.id, expectedVersion: saved.imageVersion, idempotencyKey: key, items: imageState });
      setActiveReview({ ...saved, imageVersion: result.imageVersion, images: resultImages(result) });
      setImageState(result.images.map((image) => ({ kind: "existing", clientId: `existing-${image.id}`, image })));
      clearPendingImageSync();
      setPhase("COMPLETED");
      onOpenChange(false);
    } catch (error) {
      if (syncStarted) {
        setPhase("RECONCILING");
        setImageError("Đánh giá đã lưu; đang kiểm tra trạng thái ảnh để retry an toàn.");
        return;
      }
      setPhase("IDLE");
      throw error;
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && busy) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} title={existing ? `Sửa đánh giá — ${productName}` : `Đánh giá — ${productName}`} description="Đánh giá của bạn được xác thực từ đơn hàng đã hoàn tất.">
      {!eligibility.eligible && !activeReview ? <Alert tone="info" title="Chưa đủ điều kiện">Chỉ khách đã mua và hoàn tất đơn hàng mới có thể đánh giá sản phẩm này.</Alert> : <ReviewForm key={activeReview?.id ?? "new"} fullName={me.data?.fullName ?? null} review={activeReview} imageError={imageError} onImagesChange={handleDraftChange} onSubmit={submit} />}
      {eligibility.willRequireModeration && <Alert tone="warning" title="Đang chờ kiểm duyệt">Nội dung mới sẽ vẫn được giữ ẩn cho tới khi admin khôi phục.</Alert>}
      {activeReview && !confirmDelete && <Button variant="danger" disabled={busy} onClick={() => setConfirmDelete(true)}>Xóa đánh giá</Button>}
      {confirmDelete && <div><p>Bạn có chắc muốn xóa đánh giá này?</p><Button variant="danger" loading={remove.isPending} onClick={async () => { await remove.mutateAsync(); onOpenChange(false); }}>Xác nhận xóa</Button><Button variant="secondary" onClick={() => setConfirmDelete(false)}>Hủy</Button></div>}
    </Dialog>
  );
}
