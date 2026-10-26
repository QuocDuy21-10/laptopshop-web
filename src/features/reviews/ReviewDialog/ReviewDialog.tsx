"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { Dialog } from "@/components/ui/Dialog/Dialog";
import { useMe } from "@/features/account/useMe";
import type { ReviewEligibility } from "@/lib/api/types";
import { useAddReviewImages, useCreateReview, useDeleteReview, useDeleteReviewImage, useReorderReviewImages, useUpdateReview } from "../hooks";
import { ReviewForm } from "../ReviewForm/ReviewForm";
import type { DraftImage, ReviewImagesState } from "../ReviewImagesEditor/ReviewImagesEditor";
import type { ReviewInput } from "../schema";

type Props = { productId: number; productName: string; eligibility: ReviewEligibility; open: boolean; onOpenChange: (open: boolean) => void };

const draftImages = (review: ReviewEligibility["existingReview"]): ReviewImagesState =>
  review?.images.map((image) => ({ kind: "existing", clientId: `existing-${image.id}`, image })) ?? [];

export function ReviewDialog({ productId, productName, eligibility, open, onOpenChange }: Props) {
  const me = useMe();
  const existing = eligibility.existingReview;
  const [activeReview, setActiveReview] = useState(existing);
  const [imageState, setImageState] = useState<ReviewImagesState>(() => draftImages(existing));
  const [imageError, setImageError] = useState<string | null>(null);
  useEffect(() => {
    // The dialog receives a new owner review after a successful create/rewrite; reset the editor only when its external eligibility changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveReview(existing);
    setImageState(draftImages(existing));
    setImageError(null);
  }, [existing]);
  const create = useCreateReview(productId, me.data?.id);
  const update = useUpdateReview(productId, activeReview?.id ?? 0, me.data?.id);
  const remove = useDeleteReview(productId, activeReview?.id ?? 0, me.data?.id);
  const addImages = useAddReviewImages(productId, activeReview?.id ?? 0, me.data?.id);
  const reorderImages = useReorderReviewImages(productId, activeReview?.id ?? 0, me.data?.id);
  const deleteImage = useDeleteReviewImage(productId, activeReview?.id ?? 0, me.data?.id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const submit = async (input: ReviewInput) => {
    setImageError(null);
    const response = activeReview ? await update.mutateAsync(input) : await create.mutateAsync(input);
    const saved = response.data;
    setActiveReview(saved);
    try {
      const existingIds = imageState.filter((item): item is Extract<DraftImage, { kind: "existing" }> => item.kind === "existing").map((item) => item.image.id);
      const newFiles = imageState.filter((item): item is Extract<DraftImage, { kind: "new" }> => item.kind === "new").map((item) => item.file);
      const originalIds = activeReview?.images.map((image) => image.id) ?? [];
      const removedIds = originalIds.filter((id) => !existingIds.includes(id));
      for (const imageId of removedIds) await deleteImage.mutateAsync(imageId);
      const added = newFiles.length ? await addImages.mutateAsync(newFiles) : [];
      const orderedIds = [...existingIds, ...added.map((image) => image.id)];
      const reorderResponse = orderedIds.length ? await reorderImages.mutateAsync(orderedIds) : { data: [] };
      const finalImages = reorderResponse.data.length ? reorderResponse.data : saved.images.filter((image) => orderedIds.includes(image.id)).concat(added);
      setActiveReview({ ...saved, images: finalImages });
      setImageState(finalImages.map((image) => ({ kind: "existing", clientId: `existing-${image.id}`, image })));
      onOpenChange(false);
    } catch {
      setImageError("Đánh giá đã được lưu nhưng ảnh chưa tải lên");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={existing ? `Sửa đánh giá — ${productName}` : `Đánh giá — ${productName}`} description="Đánh giá của bạn được xác thực từ đơn hàng đã hoàn tất.">
      {!eligibility.eligible && !activeReview ? <Alert tone="info" title="Chưa đủ điều kiện">Chỉ khách đã mua và hoàn tất đơn hàng mới có thể đánh giá sản phẩm này.</Alert> : <ReviewForm fullName={me.data?.fullName ?? null} review={activeReview} imageError={imageError} onImagesChange={setImageState} onSubmit={submit} />}
      {eligibility.willRequireModeration && <Alert tone="warning" title="Đang chờ kiểm duyệt">Nội dung mới sẽ vẫn được giữ ẩn cho tới khi admin khôi phục.</Alert>}
      {activeReview && !confirmDelete && <Button variant="danger" onClick={() => setConfirmDelete(true)}>Xóa đánh giá</Button>}
      {confirmDelete && <div><p>Bạn có chắc muốn xóa đánh giá này?</p><Button variant="danger" loading={remove.isPending} onClick={async () => { await remove.mutateAsync(); onOpenChange(false); }}>Xác nhận xóa</Button><Button variant="secondary" onClick={() => setConfirmDelete(false)}>Hủy</Button></div>}
    </Dialog>
  );
}
