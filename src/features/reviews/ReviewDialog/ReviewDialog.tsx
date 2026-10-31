"use client";

import { useCallback, useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { Dialog } from "@/components/ui/Dialog/Dialog";
import { useMe } from "@/features/account/useMe";
import type { ReviewEligibility } from "@/lib/api/types";
import { useDeleteReview } from "../hooks";
import { ReviewForm } from "../ReviewForm/ReviewForm";
import { ReviewImageRecovery } from "../ReviewImageRecovery/ReviewImageRecovery";
import { useReviewImageSyncWorkflow } from "../useReviewImageSyncWorkflow";

type Props = {
  productId: number;
  productName: string;
  eligibility: ReviewEligibility;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
};
export function ReviewDialog(props: Props) {
  const me = useMe();
  return (
    <ReviewDialogContent
      key={`${me.data?.id ?? 0}:${props.productId}`}
      {...props}
      userId={me.data?.id}
      fullName={me.data?.fullName ?? null}
    />
  );
}
function ReviewDialogContent({
  productId,
  productName,
  eligibility,
  open,
  onOpenChange,
  onCloseAutoFocus,
  userId,
  fullName,
}: Props & { userId?: number; fullName: string | null }) {
  const onCompleted = useCallback(() => onOpenChange(false), [onOpenChange]);
  const workflow = useReviewImageSyncWorkflow({
    productId,
    userId,
    existingReview: eligibility.existingReview,
    open,
    onCompleted,
  });
  const remove = useDeleteReview(productId, workflow.activeReview?.id ?? 0, userId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const busy = workflow.busy || remove.isPending;
  return (
    <Dialog
      onCloseAutoFocus={onCloseAutoFocus}
      open={open}
      onOpenChange={(next) => {
        if (!next && busy) return;
        onOpenChange(next);
      }}
      title={
        eligibility.existingReview ? `Sửa đánh giá — ${productName}` : `Đánh giá — ${productName}`
      }
      description="Đánh giá của bạn được xác thực từ đơn hàng đã hoàn tất."
    >
      {!eligibility.eligible && !workflow.activeReview ? (
        <Alert tone="info" title="Chưa đủ điều kiện">
          Chỉ khách đã mua và hoàn tất đơn hàng mới có thể đánh giá sản phẩm này.
        </Alert>
      ) : (
        <ReviewForm
          key={workflow.sessionId}
          fullName={fullName}
          review={workflow.activeReview}
          imageState={workflow.imageState}
          imagesLocked={workflow.imagesLocked}
          submitDisabled={workflow.submitDisabled}
          imageError={workflow.imageError}
          onImagesChange={workflow.setImageState}
          onSubmit={workflow.submit}
          recovery={
            workflow.pending && ["WAITING_FILES", "WAITING_RETRY"].includes(workflow.phase) ? (
              <ReviewImageRecovery
                pending={workflow.pending}
                filesByClientId={workflow.recoveryFiles}
                invalidClientIds={workflow.invalidClientIds}
                disabled={!["WAITING_FILES", "WAITING_RETRY"].includes(workflow.phase)}
                onReselect={(id, file) => void workflow.selectRecoveryFile(id, file)}
              />
            ) : undefined
          }
        />
      )}
      {workflow.pending && workflow.phase === "WAITING_RETRY" ? (
        <Button onClick={() => void workflow.retryImages()}>Gửi tiếp ảnh</Button>
      ) : null}
      {(workflow.pending || workflow.phase === "UNKNOWN") && !busy ? (
        <Button variant="secondary" onClick={() => void workflow.checkAgain()}>
          Kiểm tra lại trạng thái ảnh
        </Button>
      ) : null}
      {workflow.phase === "FAILED" ? (
        <Button disabled={!workflow.restartReady} onClick={workflow.restart}>
          Bắt đầu lại với dữ liệu mới
        </Button>
      ) : null}
      {eligibility.willRequireModeration && (
        <Alert tone="warning" title="Đang chờ kiểm duyệt">
          Nội dung mới sẽ vẫn được giữ ẩn cho tới khi admin khôi phục.
        </Alert>
      )}
      {workflow.activeReview && !confirmDelete && (
        <Button variant="danger" disabled={busy} onClick={() => setConfirmDelete(true)}>
          Xóa đánh giá
        </Button>
      )}
      {confirmDelete && (
        <div>
          <p>Bạn có chắc muốn xóa đánh giá này?</p>
          <Button
            variant="danger"
            loading={remove.isPending}
            onClick={async () => {
              await remove.mutateAsync();
              workflow.reviewDeleted();
              onOpenChange(false);
            }}
          >
            Xác nhận xóa
          </Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Hủy
          </Button>
        </div>
      )}
    </Dialog>
  );
}
