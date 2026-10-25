"use client";

import { Alert, Button, Descriptions, Space, Tag } from "antd";
import { errorMessage } from "@/lib/api/errors";
import { stateLabel } from "./labels";
import { useAdminPromotion, useTransitionPromotion } from "./hooks";

export function PromotionDetail({ id }: { id: number }) {
  const result = useAdminPromotion(id);
  const transition = useTransitionPromotion(id);
  if (result.isPending) return <p>Đang tải…</p>;
  if (result.error || !result.data) return <Alert type="error" message={errorMessage(result.error)} />;
  const promotion = result.data.data;
  const action = promotion.state === "DRAFT" ? "ACTIVATE" : promotion.state === "ACTIVE" ? "PAUSE" : promotion.state === "PAUSED" ? "RESUME" : null;
  return <>
    <Space><Tag>{stateLabel[promotion.effectiveState] ?? promotion.effectiveState}</Tag>{action && <Button onClick={() => transition.mutate(action)}>{action === "ACTIVATE" ? "Kích hoạt" : action === "PAUSE" ? "Tạm dừng" : "Tiếp tục"}</Button>}</Space>
    <Descriptions bordered column={1} style={{ marginTop: 16 }}>
      <Descriptions.Item label="Tên">{promotion.name}</Descriptions.Item>
      <Descriptions.Item label="Loại">{promotion.kind}</Descriptions.Item>
      <Descriptions.Item label="Mức giảm">{promotion.discountValue}{promotion.discountKind === "PERCENT" ? "%" : " ₫"}</Descriptions.Item>
      {promotion.coupon && <Descriptions.Item label="Mã">{promotion.coupon.code}</Descriptions.Item>}
      <Descriptions.Item label="Trường đã khóa">{promotion.lockedFields.join(", ") || "Chưa khóa"}</Descriptions.Item>
    </Descriptions>
  </>;
}
