"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { Dialog } from "@/components/ui/Dialog/Dialog";
import { useMe } from "@/features/account/useMe";
import type { ReviewEligibility } from "@/lib/api/types";
import { useCreateReview, useDeleteReview, useUpdateReview } from "../hooks";
import { ReviewForm } from "../ReviewForm/ReviewForm";
import type { ReviewInput } from "../schema";

type Props = { productId: number; productName: string; eligibility: ReviewEligibility; open: boolean; onOpenChange: (open: boolean) => void };

export function ReviewDialog({ productId, productName, eligibility, open, onOpenChange }: Props) {
  const me = useMe();
  const existing = eligibility.existingReview;
  const create = useCreateReview(productId, me.data?.id);
  const update = useUpdateReview(productId, existing?.id ?? 0, me.data?.id);
  const remove = useDeleteReview(productId, existing?.id ?? 0, me.data?.id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const submit = async (input: ReviewInput) => {
    if (existing) await update.mutateAsync(input);
    else await create.mutateAsync(input);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={existing ? `Sửa đánh giá — ${productName}` : `Đánh giá — ${productName}`} description="Đánh giá của bạn được xác thực từ đơn hàng đã hoàn tất.">
      {!eligibility.eligible && !existing ? <Alert tone="info" title="Chưa đủ điều kiện">Chỉ khách đã mua và hoàn tất đơn hàng mới có thể đánh giá sản phẩm này.</Alert> : <ReviewForm fullName={me.data?.fullName ?? null} review={existing} onSubmit={submit} />}
      {eligibility.willRequireModeration && <Alert tone="warning" title="Đang chờ kiểm duyệt">Nội dung mới sẽ vẫn được giữ ẩn cho tới khi admin khôi phục.</Alert>}
      {existing && !confirmDelete && <Button variant="danger" onClick={() => setConfirmDelete(true)}>Xóa đánh giá</Button>}
      {confirmDelete && <div><p>Bạn có chắc muốn xóa đánh giá này?</p><Button variant="danger" loading={remove.isPending} onClick={async () => { await remove.mutateAsync(); onOpenChange(false); }}>Xác nhận xóa</Button><Button variant="secondary" onClick={() => setConfirmDelete(false)}>Hủy</Button></div>}
    </Dialog>
  );
}
