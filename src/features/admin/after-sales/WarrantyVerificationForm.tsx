"use client";

import { Button, DatePicker, Form, Input, Select } from "antd";
import { useCreateWarrantyVerification } from "./hooks";

const DECISIONS = [{ value: "IN_WARRANTY", label: "Còn bảo hành" }, { value: "OUT_OF_WARRANTY", label: "Hết bảo hành" }, { value: "NO_WARRANTY", label: "Không có bảo hành" }, { value: "UNVERIFIABLE", label: "Chưa thể xác minh" }];
const NEEDS_DATES = new Set(["IN_WARRANTY", "OUT_OF_WARRANTY"]);

// a saved decision can be corrected: every submit adds a new audited verification record
export function WarrantyVerificationForm({ requestId, itemId, expectedVersion, current }: { requestId: number; itemId: number; expectedVersion: number; current: unknown }) {
  const verify = useCreateWarrantyVerification(requestId, itemId);
  const [form] = Form.useForm();
  const decision = Form.useWatch("decision", form);
  const needsDates = NEEDS_DATES.has(decision);
  // the generated API type for this field is too loose, so read it defensively
  const saved = current && typeof current === "object" && "decision" in current ? String(current.decision) : null;
  return <Form form={form} name={`warranty-verification-${itemId}`} layout="vertical" onFinish={(values) => verify.mutate({ expectedVersion, decision: values.decision, warrantyStartAt: needsDates ? values.start?.toISOString() : undefined, warrantyEndAt: needsDates ? values.end?.toISOString() : undefined, note: values.note })}>
    {saved && <p>Đã xác minh: {DECISIONS.find((option) => option.value === saved)?.label ?? saved}</p>}
    <Form.Item name="decision" label="Kết quả xác minh" rules={[{ required: true }]}><Select options={DECISIONS} /></Form.Item>
    {needsDates && <>
      <Form.Item name="start" label="Bắt đầu bảo hành" preserve={false} rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}><DatePicker /></Form.Item>
      <Form.Item name="end" label="Kết thúc bảo hành" preserve={false} dependencies={["start"]} rules={[{ required: true, message: "Chọn ngày kết thúc" }, ({ getFieldValue }) => ({ validator: (_, value) => !value || !getFieldValue("start") || !value.isBefore(getFieldValue("start")) ? Promise.resolve() : Promise.reject(new Error("Ngày kết thúc phải sau ngày bắt đầu")) })]}><DatePicker /></Form.Item>
    </>}
    <Form.Item name="note" label="Ghi chú nội bộ"><Input.TextArea /></Form.Item>
    <Button htmlType="submit" type="primary" loading={verify.isPending}>{saved ? "Cập nhật xác minh" : "Lưu xác minh"}</Button>
  </Form>;
}
