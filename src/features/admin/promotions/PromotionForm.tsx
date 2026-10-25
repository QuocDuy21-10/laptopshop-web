"use client";

import { Alert, Button, Form, Input, InputNumber, Select, Switch } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { errorMessage } from "@/lib/api/errors";
import { FlashSaleQuotaEditor, validateQuotaItems, type FlashSaleQuotaItem } from "./FlashSaleQuotaEditor";
import { useCreatePromotion, type PromotionCreateBody } from "./hooks";

type FormValues = {
  name: string;
  kind: PromotionCreateBody["kind"];
  startsAt: string;
  endsAt: string;
  discountKind: PromotionCreateBody["discountKind"];
  discountValue: number;
  coupon?: { code?: string; isPublic?: boolean };
  flashSale?: { priority?: number; stackableWithCoupon?: boolean; showRemainingQuota?: boolean };
};

const toIso = (local: string) => new Date(local).toISOString();

export function PromotionForm() {
  const router = useRouter();
  const create = useCreatePromotion();
  const [form] = Form.useForm<FormValues>();
  const kind = Form.useWatch("kind", form);
  const [quotas, setQuotas] = useState<FlashSaleQuotaItem[]>([]);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  const onFinish = (values: FormValues) => {
    const { startsAt, endsAt, coupon, flashSale, ...rest } = values;
    const base = { ...rest, startsAt: toIso(startsAt), endsAt: toIso(endsAt) };
    let body: PromotionCreateBody;
    if (values.kind === "FLASH_SALE") {
      const error = validateQuotaItems(quotas);
      setQuotaError(error);
      if (error) return;
      body = { ...base, flashSale: { priority: flashSale?.priority ?? 0, stackableWithCoupon: flashSale?.stackableWithCoupon ?? false, showRemainingQuota: flashSale?.showRemainingQuota ?? true, items: quotas } };
    } else {
      body = values.kind === "COUPON" ? { ...base, coupon: { code: coupon?.code ?? "", scope: "ORDER", isPublic: coupon?.isPublic ?? false } } : base;
    }
    create.mutate(body, { onSuccess: (result) => router.push(`/admin/promotions/${result.data.id}`) });
  };

  return <Form form={form} layout="vertical" initialValues={{ kind: "COUPON", discountKind: "PERCENT", discountValue: 10, flashSale: { priority: 0, stackableWithCoupon: false, showRemainingQuota: true } }} onFinish={onFinish}>
    <Form.Item name="name" label="Tên chương trình" rules={[{ required: true }]}><Input /></Form.Item>
    <Form.Item name="kind" label="Loại" rules={[{ required: true }]}><Select aria-label="Loại" options={[{ value: "COUPON", label: "Coupon" }, { value: "AUTOMATIC", label: "Tự động" }, { value: "FLASH_SALE", label: "Flash Sale" }]} /></Form.Item>
    <Form.Item name="startsAt" label="Bắt đầu" rules={[{ required: true }]}><Input type="datetime-local" /></Form.Item>
    <Form.Item name="endsAt" label="Kết thúc" rules={[{ required: true }]}><Input type="datetime-local" /></Form.Item>
    <Form.Item name="discountKind" label="Kiểu giảm" rules={[{ required: true }]}><Select options={[{ value: "PERCENT", label: "Phần trăm" }, { value: "FIXED", label: "Số tiền" }]} /></Form.Item>
    <Form.Item name="discountValue" label="Mức giảm" rules={[{ required: true }]}><InputNumber min={1} /></Form.Item>
    {kind === "COUPON" && <>
      <Form.Item name={["coupon", "code"]} label="Mã coupon"><Input /></Form.Item>
      <Form.Item name={["coupon", "isPublic"]} label="Công khai" valuePropName="checked"><Switch /></Form.Item>
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
