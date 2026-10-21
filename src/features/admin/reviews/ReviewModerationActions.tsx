"use client";

import { Button, Input, Modal, Popconfirm } from "antd";
import { useState } from "react";
import type { AdminReviewDetail } from "@/lib/api/types";
import { useModerateReview } from "./hooks";

export function ReviewModerationActions({ review }: { review: AdminReviewDetail }) {
  const [hideOpen, setHideOpen] = useState(false);
  const [reason, setReason] = useState("");
  const mutation = useModerateReview(review.id);
  if (review.deletedAt) return null;
  if (review.status === "HIDDEN") return <Popconfirm title="Khôi phục review?" onConfirm={() => mutation.mutate({ status: "PUBLISHED" })}><Button loading={mutation.isPending}>Khôi phục</Button></Popconfirm>;
  return <><Button danger onClick={() => setHideOpen(true)}>Ẩn review</Button><Modal open={hideOpen} title="Ẩn review" okText="Ẩn" cancelText="Huỷ" okButtonProps={{ danger: true, disabled: !reason.trim() }} confirmLoading={mutation.isPending} onCancel={() => setHideOpen(false)} onOk={() => mutation.mutate({ status: "HIDDEN", reason: reason.trim() }, { onSuccess: () => setHideOpen(false) })}><Input.TextArea rows={4} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Lý do ẩn review" /></Modal></>;
}
