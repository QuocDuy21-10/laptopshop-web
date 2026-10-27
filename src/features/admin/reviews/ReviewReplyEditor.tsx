"use client";

import { Alert, Button, Card, Input, Modal, Space, Typography } from "antd";
import { useState } from "react";
import type { AdminReviewDetail } from "@/lib/api/types";
import { errorMessage } from "@/lib/api/errors";
import { useDeleteReviewReply, usePutReviewReply } from "./hooks";

export function ReviewReplyEditor({ review }: { review: AdminReviewDetail }) {
  const [content, setContent] = useState(review.officialReply?.content ?? "");
  const put = usePutReviewReply(review.id);
  const remove = useDeleteReviewReply(review.id);
  const readOnly = Boolean(review.deletedAt);
  const save = () => void put.mutateAsync({ content }).catch(() => undefined);
  const confirmDelete = () => Modal.confirm({ title: "Xoá phản hồi chính thức?", okText: "Xoá", cancelText: "Huỷ", onOk: () => remove.mutateAsync() });
  return <Card title="Phản hồi chính thức" extra={<Typography.Text type="secondary">LaptopShop</Typography.Text>}>
    {put.isError && <Alert type="error" showIcon message={errorMessage(put.error)} />}
    {remove.isError && <Alert type="error" showIcon message={errorMessage(remove.error)} />}
    <Input.TextArea value={content} onChange={(event) => setContent(event.target.value)} maxLength={1000} showCount rows={5} disabled={readOnly || put.isPending || remove.isPending} placeholder="Viết phản hồi của LaptopShop" />
    <Space style={{ marginTop: 12 }}>
      <Button type="primary" onClick={save} loading={put.isPending} disabled={readOnly || !content.trim()}>Lưu phản hồi</Button>
      {review.officialReply && <Button danger onClick={confirmDelete} loading={remove.isPending} disabled={readOnly}>Xoá phản hồi</Button>}
    </Space>
  </Card>;
}
