"use client";

import { Button, Form, Input, InputNumber, Select, Switch } from "antd";
import { useRouter } from "next/navigation";
import { useCreatePromotion, type PromotionCreateBody } from "./hooks";

const DEFAULT_START = "2026-10-22T00:00:00.000Z";
const DEFAULT_END = "2026-10-29T00:00:00.000Z";

export function PromotionForm() {
  const router = useRouter();
  const create = useCreatePromotion();
  const [form] = Form.useForm<PromotionCreateBody>();
  return <Form form={form} layout="vertical" initialValues={{ kind: "COUPON", discountKind: "PERCENT", discountValue: 10, startsAt: DEFAULT_START, endsAt: DEFAULT_END, coupon: { scope: "ORDER", maxUsesPerUser: 1, isPublic: false } }} onFinish={(values) => create.mutate(values, { onSuccess: (result) => router.push(`/admin/promotions/${result.data.id}`) })}>
    <Form.Item name="name" label="Tên chương trình" rules={[{ required: true }]}><Input /></Form.Item>
    <Form.Item name="kind" label="Loại" rules={[{ required: true }]}><Select options={[{ value: "COUPON", label: "Coupon" }, { value: "AUTOMATIC", label: "Tự động" }]} /></Form.Item>
    <Form.Item name="discountKind" label="Kiểu giảm" rules={[{ required: true }]}><Select options={[{ value: "PERCENT", label: "Phần trăm" }, { value: "FIXED", label: "Số tiền" }]} /></Form.Item>
    <Form.Item name="discountValue" label="Mức giảm" rules={[{ required: true }]}><InputNumber min={1} /></Form.Item>
    <Form.Item name={["coupon", "code"]} label="Mã coupon"><Input /></Form.Item>
    <Form.Item name={["coupon", "isPublic"]} label="Công khai" valuePropName="checked"><Switch /></Form.Item>
    <Button type="primary" htmlType="submit" loading={create.isPending}>Lưu bản nháp</Button>
  </Form>;
}
