"use client";

import { Button, DatePicker, Form, Input, Select } from "antd";
import { useCreateWarrantyVerification } from "./hooks";

export function WarrantyVerificationForm({ requestId, itemId, expectedVersion, visible }: { requestId: number; itemId: number; expectedVersion: number; visible: boolean }) {
  const verify = useCreateWarrantyVerification(requestId, itemId);
  if (!visible) return null;
  return <Form layout="vertical" onFinish={(values) => verify.mutate({ expectedVersion, decision: values.decision, warrantyStartAt: values.start?.toISOString(), warrantyEndAt: values.end?.toISOString(), note: values.note })}>
    <Form.Item name="decision" label="Kết quả xác minh" rules={[{ required: true }]}><Select options={[{ value: "IN_WARRANTY", label: "Còn bảo hành" }, { value: "OUT_OF_WARRANTY", label: "Hết bảo hành" }, { value: "NO_WARRANTY", label: "Không có bảo hành" }, { value: "UNVERIFIABLE", label: "Chưa thể xác minh" }]} /></Form.Item>
    <Form.Item name="start" label="Bắt đầu bảo hành"><DatePicker /></Form.Item>
    <Form.Item name="end" label="Kết thúc bảo hành"><DatePicker /></Form.Item>
    <Form.Item name="note" label="Ghi chú nội bộ"><Input.TextArea /></Form.Item>
    <Button htmlType="submit" type="primary" loading={verify.isPending}>Lưu xác minh</Button>
  </Form>;
}
