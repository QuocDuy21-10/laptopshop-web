"use client";

import { Alert, Button, Form, Input, InputNumber, Select, Switch } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { errorMessage } from "@/lib/api/errors";
import { FlashSaleQuotaEditor, validateQuotaItems, type FlashSaleQuotaItem } from "./FlashSaleQuotaEditor";
import { useCreatePromotion, type PromotionCreateBody } from "./hooks";
import { PromotionTargetSelect } from "./PromotionTargetSelect";

type FormValues = {
  name: string;
  kind: PromotionCreateBody["kind"];
  startsAt: string;
  endsAt: string;
  discountKind: PromotionCreateBody["discountKind"];
  discountValue: number;
  coupon?: {
    code?: string;
    scope?: "ORDER" | "PRODUCT";
    minOrderValue?: number | null;
    maxDiscount?: number | null;
    maxUses?: number | null;
    maxUsesPerUser?: number | null;
    isPublic?: boolean;
    targetProductIds?: number[];
  };
  automatic?: { priority?: number | null; stackableWithCoupon?: boolean; targetProductIds?: number[] };
  flashSale?: { priority?: number; stackableWithCoupon?: boolean; showRemainingQuota?: boolean };
};

const toIso = (local: string) => new Date(local).toISOString();

const targetsField = (name: string[]) => (
  <Form.Item name={name} label="Sản phẩm áp dụng" rules={[{ required: true, type: "array", min: 1, message: "Chọn ít nhất một sản phẩm." }]}>
    <PromotionTargetSelect />
  </Form.Item>
);

export function PromotionForm() {
  const router = useRouter();
  const create = useCreatePromotion();
  const [form] = Form.useForm<FormValues>();
  const kind = Form.useWatch("kind", form);
  const discountKind = Form.useWatch("discountKind", form);
  const couponScope = Form.useWatch(["coupon", "scope"], form);
  const [quotas, setQuotas] = useState<FlashSaleQuotaItem[]>([]);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  const onFinish = (values: FormValues) => {
    const { startsAt, endsAt, coupon, automatic, flashSale, ...rest } = values;
    const base = { ...rest, startsAt: toIso(startsAt), endsAt: toIso(endsAt) };
    let body: PromotionCreateBody;
    if (values.kind === "FLASH_SALE") {
      const error = validateQuotaItems(quotas);
      setQuotaError(error);
      if (error) return;
      body = { ...base, flashSale: { priority: flashSale?.priority ?? 0, stackableWithCoupon: flashSale?.stackableWithCoupon ?? false, showRemainingQuota: flashSale?.showRemainingQuota ?? true, items: quotas } };
    } else if (values.kind === "AUTOMATIC") {
      body = { ...base, automatic: { priority: automatic?.priority ?? 0, stackableWithCoupon: automatic?.stackableWithCoupon ?? false, targetProductIds: automatic?.targetProductIds ?? [] } };
    } else {
      const scope = coupon?.scope ?? "ORDER";
      body = {
        ...base,
        coupon: {
          code: coupon?.code?.trim() ?? "",
          scope,
          minOrderValue: coupon?.minOrderValue ?? 0,
          // the API rejects maxDiscount on a FIXED coupon
          maxDiscount: values.discountKind === "PERCENT" ? (coupon?.maxDiscount ?? null) : null,
          maxUses: coupon?.maxUses ?? null,
          maxUsesPerUser: coupon?.maxUsesPerUser ?? 1,
          isPublic: coupon?.isPublic ?? false,
          targetProductIds: scope === "PRODUCT" ? (coupon?.targetProductIds ?? []) : [],
        },
      };
    }
    create.mutate(body, { onSuccess: (result) => router.push(`/admin/promotions/${result.data.id}`) });
  };

  return <Form form={form} layout="vertical" initialValues={{ kind: "COUPON", discountKind: "PERCENT", discountValue: 10, coupon: { scope: "ORDER", minOrderValue: 0, maxUsesPerUser: 1, isPublic: false }, automatic: { priority: 0, stackableWithCoupon: false }, flashSale: { priority: 0, stackableWithCoupon: false, showRemainingQuota: true } }} onFinish={onFinish}>
    <Form.Item name="name" label="Tên chương trình" rules={[{ required: true }]}><Input /></Form.Item>
    <Form.Item name="kind" label="Loại" rules={[{ required: true }]}><Select aria-label="Loại" options={[{ value: "COUPON", label: "Coupon" }, { value: "AUTOMATIC", label: "Tự động" }, { value: "FLASH_SALE", label: "Flash Sale" }]} /></Form.Item>
    <Form.Item name="startsAt" label="Bắt đầu" rules={[{ required: true }]}><Input type="datetime-local" /></Form.Item>
    <Form.Item name="endsAt" label="Kết thúc" rules={[{ required: true }]}><Input type="datetime-local" /></Form.Item>
    <Form.Item name="discountKind" label="Kiểu giảm" rules={[{ required: true }]}><Select options={[{ value: "PERCENT", label: "Phần trăm" }, { value: "FIXED", label: "Số tiền" }]} /></Form.Item>
    <Form.Item name="discountValue" label="Mức giảm" rules={[{ required: true }]}><InputNumber min={1} /></Form.Item>
    {kind === "COUPON" && <>
      <Form.Item name={["coupon", "code"]} label="Mã coupon" rules={[{ required: true, whitespace: true, message: "Nhập mã coupon." }]}><Input /></Form.Item>
      <Form.Item name={["coupon", "scope"]} label="Phạm vi"><Select aria-label="Phạm vi" options={[{ value: "ORDER", label: "Toàn đơn" }, { value: "PRODUCT", label: "Theo sản phẩm" }]} /></Form.Item>
      {couponScope === "PRODUCT" && targetsField(["coupon", "targetProductIds"])}
      <Form.Item name={["coupon", "minOrderValue"]} label="Giá trị đơn tối thiểu"><InputNumber min={0} precision={0} /></Form.Item>
      {discountKind === "PERCENT" && <Form.Item name={["coupon", "maxDiscount"]} label="Giảm tối đa"><InputNumber min={1} precision={0} /></Form.Item>}
      <Form.Item name={["coupon", "maxUses"]} label="Tổng lượt dùng"><InputNumber min={1} precision={0} /></Form.Item>
      <Form.Item name={["coupon", "maxUsesPerUser"]} label="Lượt mỗi khách"><InputNumber min={1} precision={0} /></Form.Item>
      <Form.Item name={["coupon", "isPublic"]} label="Công khai" valuePropName="checked"><Switch /></Form.Item>
    </>}
    {kind === "AUTOMATIC" && <>
      <Form.Item name={["automatic", "priority"]} label="Độ ưu tiên"><InputNumber precision={0} /></Form.Item>
      <Form.Item name={["automatic", "stackableWithCoupon"]} label="Cho phép dùng cùng coupon" valuePropName="checked"><Switch /></Form.Item>
      {targetsField(["automatic", "targetProductIds"])}
    </>}
    {kind === "FLASH_SALE" && <>
      <Form.Item name={["flashSale", "priority"]} label="Độ ưu tiên"><InputNumber precision={0} /></Form.Item>
      <Form.Item name={["flashSale", "stackableWithCoupon"]} label="Cho phép dùng cùng coupon" valuePropName="checked"><Switch /></Form.Item>
      <Form.Item name={["flashSale", "showRemainingQuota"]} label="Hiển thị số suất còn lại" valuePropName="checked"><Switch /></Form.Item>
      <FlashSaleQuotaEditor value={quotas} onChange={(next) => { setQuotas(next); setQuotaError(null); }} />
      {quotaError && <Alert type="error" message={quotaError} showIcon style={{ marginBottom: 16 }} />}
    </>}
    {create.error && <Alert type="error" message={errorMessage(create.error)} showIcon style={{ marginBottom: 16 }} />}
    <Button type="primary" htmlType="submit" loading={create.isPending}>Lưu bản nháp</Button>
  </Form>;
}
