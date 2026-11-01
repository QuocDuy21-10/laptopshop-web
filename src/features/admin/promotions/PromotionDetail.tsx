"use client";

import { Alert, Button, Descriptions, Space, Switch, Tag } from "antd";
import { useState } from "react";
import { errorMessage } from "@/lib/api/errors";
import type { FlashSaleAllocationQuery, PromotionDetail as PromotionDetailDto } from "@/lib/api/types";
import { FlashSaleAllocations } from "./FlashSaleAllocations";
import { FlashSaleQuotaEditor, validateQuotaItems, type FlashSaleQuotaItem } from "./FlashSaleQuotaEditor";
import { FlashSaleSummary } from "./FlashSaleSummary";
import { PromotionForm } from "./PromotionForm";
import { stateLabel } from "./labels";
import { useAdminPromotion, useAdminPromotionAllocations, useAdminPromotionSummary, useTransitionPromotion, useUpdatePromotion } from "./hooks";

type FlashSale = NonNullable<PromotionDetailDto["flashSale"]>;

function FlashSaleManager({ id, promotion, flashSale }: { id: number; promotion: PromotionDetailDto; flashSale: FlashSale }) {
  const update = useUpdatePromotion(id);
  const locked = promotion.lockedFields.includes("maxUnitsPerUser");
  const [items, setItems] = useState<FlashSaleQuotaItem[]>(() => flashSale.quotas.map(({ productId, totalQuota, maxUnitsPerUser }) => ({ productId, totalQuota, maxUnitsPerUser })));
  const [showRemainingQuota, setShowRemainingQuota] = useState(flashSale.showRemainingQuota);
  const productNames = Object.fromEntries(promotion.products.map((product) => [product.id, product.name]));
  const minTotals = locked ? Object.fromEntries(flashSale.quotas.map((quota) => [quota.productId, quota.totalQuota])) : undefined;
  const invalid = validateQuotaItems(items, minTotals) !== null;
  const save = () =>
    update.mutate({
      flashSale: locked
        ? { showRemainingQuota, items }
        : { priority: flashSale.priority, stackableWithCoupon: flashSale.stackableWithCoupon, showRemainingQuota, items },
    });
  return <>
    <FlashSaleQuotaEditor value={items} onChange={setItems} locked={locked} productNames={productNames} minTotals={minTotals} />
    <Space style={{ marginTop: 16 }}>
      <Switch checked={showRemainingQuota} onChange={setShowRemainingQuota} aria-label="Hiển thị số suất còn lại" /> Hiển thị số suất còn lại
      <Button type="primary" disabled={invalid} loading={update.isPending} onClick={save}>Lưu quota Flash Sale</Button>
    </Space>
    {update.error && <Alert type="error" message={errorMessage(update.error)} showIcon style={{ marginTop: 16 }} />}
  </>;
}

export function PromotionDetail({ id }: { id: number }) {
  const result = useAdminPromotion(id);
  const transition = useTransitionPromotion(id);
  const isFlashSale = result.data?.data.kind === "FLASH_SALE";
  const [allocationQuery, setAllocationQuery] = useState<FlashSaleAllocationQuery>({ page: 1, pageSize: 10 });
  const summary = useAdminPromotionSummary(id, isFlashSale);
  const allocations = useAdminPromotionAllocations(id, allocationQuery, isFlashSale);
  if (result.isPending) return <p>Đang tải…</p>;
  if (result.error || !result.data) return <Alert type="error" message={errorMessage(result.error)} />;
  const promotion = result.data.data;
  const action = promotion.state === "DRAFT" ? "ACTIVATE" : promotion.state === "ACTIVE" ? "PAUSE" : promotion.state === "PAUSED" ? "RESUME" : null;
  const stats = summary.data?.data;
  return <>
    <Space><Tag>{stateLabel[promotion.effectiveState] ?? promotion.effectiveState}</Tag>{action && <Button onClick={() => transition.mutate(action)}>{action === "ACTIVATE" ? "Kích hoạt" : action === "PAUSE" ? "Tạm dừng" : "Tiếp tục"}</Button>}</Space>
    <Descriptions bordered column={1} style={{ marginTop: 16 }}>
      <Descriptions.Item label="Tên">{promotion.name}</Descriptions.Item>
      <Descriptions.Item label="Loại">{promotion.kind}</Descriptions.Item>
      <Descriptions.Item label="Mức giảm">{promotion.discountValue}{promotion.discountKind === "PERCENT" ? "%" : " ₫"}</Descriptions.Item>
      {promotion.coupon && <Descriptions.Item label="Mã">{promotion.coupon.code}</Descriptions.Item>}
      <Descriptions.Item label="Trường đã khóa">{promotion.lockedFields.join(", ") || "Chưa khóa"}</Descriptions.Item>
    </Descriptions>
    {promotion.state === "DRAFT" && promotion.kind !== "FLASH_SALE" && <div style={{ marginTop: 16 }}>
      <PromotionForm key={promotion.updatedAt} promotion={promotion} />
    </div>}
    {promotion.flashSale && <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
      <FlashSaleManager key={promotion.updatedAt} id={id} promotion={promotion} flashSale={promotion.flashSale} />
      {summary.error && <Alert type="error" message={errorMessage(summary.error)} showIcon />}
      {stats && <FlashSaleSummary summary={{
        totalQuota: stats.totalQuota ?? 0, claimedUnits: stats.claimedUnits ?? 0, remainingUnits: stats.remainingUnits ?? 0,
        releasedUnits: stats.releasedUnits ?? 0, completedUnits: stats.completedUnits ?? 0, totalDiscountAmount: stats.totalDiscountAmount,
      }} />}
      {allocations.error && <Alert type="error" message={errorMessage(allocations.error)} showIcon />}
      {allocations.data && <FlashSaleAllocations
        allocations={allocations.data.data}
        meta={allocations.data.meta}
        status={allocationQuery.status}
        onStatus={(status) => setAllocationQuery((query) => ({ ...query, status, page: 1 }))}
        onPage={(page) => setAllocationQuery((query) => ({ ...query, page }))}
      />}
    </div>}
  </>;
}
