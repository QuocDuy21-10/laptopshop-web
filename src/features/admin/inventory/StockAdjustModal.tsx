"use client";

import { App, Form, Input, InputNumber, Modal, Radio } from "antd";
import { errorMessage } from "@/lib/api/errors";
import type { Product } from "@/lib/api/types";
import { setServerErrors } from "../form-errors";
import { type AdjustBody, useAdjustStock } from "./hooks";

type Values = { reason: AdjustBody["reason"]; delta?: number; note?: string };

export function StockAdjustModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const adjust = useAdjustStock();
  const reason = Form.useWatch("reason", form) ?? "RESTOCK";
  const delta = Form.useWatch("delta", form);

  const onFinish = ({ reason, delta, note }: Values) =>
    adjust.mutate(
      { productId: product.id, delta: delta ?? 0, reason, ...(note?.trim() ? { note: note.trim() } : {}) },
      {
        onSuccess: () => {
          message.success("Đã cập nhật tồn kho");
          onClose();
        },
        onError: (e) => {
          setServerErrors(form, e);
          message.error(errorMessage(e));
        },
      },
    );

  return (
    <Modal
      open
      title={`Điều chỉnh kho: ${product.name}`}
      okText="Xác nhận"
      cancelText="Huỷ"
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={adjust.isPending}
    >
      <Form form={form} layout="vertical" disabled={adjust.isPending} onFinish={onFinish} initialValues={{ reason: "RESTOCK" }}>
        <Form.Item name="reason" label="Loại">
          <Radio.Group
            options={[
              { value: "RESTOCK", label: "Nhập hàng" },
              { value: "CORRECTION", label: "Điều chỉnh kiểm kê" },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="delta"
          label="Số lượng thay đổi"
          extra={`Tồn kho: ${product.quantity} → ${product.quantity + (delta ?? 0)}`}
          rules={[
            { required: true, message: "Nhập số lượng" },
            {
              validator: (_, v?: number) =>
                v === undefined || (v !== 0 && Math.abs(v) <= 10000 && (reason === "CORRECTION" || v > 0))
                  ? Promise.resolve()
                  : Promise.reject(new Error(reason === "RESTOCK" ? "Nhập hàng phải là số dương" : "Số lượng khác 0, tối đa 10.000")),
            },
          ]}
        >
          <InputNumber precision={0} min={reason === "RESTOCK" ? 1 : -10000} max={10000} />
        </Form.Item>
        <Form.Item
          name="note"
          label="Ghi chú"
          rules={[
            { max: 500, message: "Tối đa 500 ký tự" },
            ...(reason === "CORRECTION" ? [{ required: true, whitespace: true, message: "Nhập lý do điều chỉnh" }] : []),
          ]}
        >
          <Input.TextArea rows={2} maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
