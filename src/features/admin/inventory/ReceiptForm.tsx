"use client";

import { App, Button, Form, Input, InputNumber, Select, Space } from "antd";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { errorMessage } from "@/lib/api/errors";
import { formatVnd } from "@/lib/format";
import { setServerErrors } from "../form-errors";
import { useAdminProducts } from "../products/hooks";
import type { ReceiptCreateBody } from "./hooks";
import styles from "./inventory.module.scss";

type ReceiptFormValues = {
  supplierName?: string;
  note?: string;
  items: Array<{ productId?: number; quantity?: number; unitCost?: number }>;
};

type ReceiptFormProps = {
  initialValue?: Partial<ReceiptFormValues>;
  onSubmit: (body: ReceiptCreateBody) => Promise<void> | void;
  submitting: boolean;
};

export function ReceiptForm({ initialValue, onSubmit, submitting }: ReceiptFormProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<ReceiptFormValues>();
  const values = Form.useWatch([], form) ?? { items: [] };
  const products = useAdminProducts({ page: 1, pageSize: 50, isActive: true });
  const items = values.items ?? [];
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const totalValue = items.reduce(
    (sum, item) => sum + (item.quantity ?? 0) * (item.unitCost ?? 0),
    0,
  );

  useEffect(() => {
    if (initialValue) form.setFieldsValue(initialValue);
  }, [form, initialValue]);

  const submit = async (input: ReceiptFormValues) => {
    const body: ReceiptCreateBody = {
      ...(input.supplierName?.trim() ? { supplierName: input.supplierName.trim() } : {}),
      ...(input.note?.trim() ? { note: input.note.trim() } : {}),
      items: input.items.map((item) => ({
        productId: item.productId ?? 0,
        quantity: item.quantity ?? 0,
        unitCost: item.unitCost,
      })),
    };
    try {
      await onSubmit(body);
    } catch (error) {
      setServerErrors(form, error);
      message.error(errorMessage(error));
    }
  };

  return (
    <Form<ReceiptFormValues>
      form={form}
      layout="vertical"
      className={styles.form}
      initialValues={{ items: [{ quantity: 1 }], ...initialValue }}
      disabled={submitting}
      onFinish={submit}
    >
      <Form.Item name="supplierName" label="Nhà cung cấp">
        <Input maxLength={255} />
      </Form.Item>
      <Form.Item name="note" label="Ghi chú">
        <Input.TextArea rows={2} maxLength={500} />
      </Form.Item>
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <div className={styles.items}>
            {fields.map((field, index) => {
              const selectedIds = items.map((item) => item.productId).filter(Boolean);
              const { key, ...fieldProps } = field;
              return (
                <div className={styles.item} key={key}>
                  <Form.Item
                    {...fieldProps}
                    name={[field.name, "productId"]}
                    label={`Sản phẩm ${index + 1}`}
                    rules={[{ required: true, message: "Chọn sản phẩm" }]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="label"
                      options={products.data?.data.map((product) => ({
                        value: product.id,
                        label: product.name,
                        disabled:
                          selectedIds.includes(product.id) &&
                          product.id !== items[index]?.productId,
                      }))}
                    />
                  </Form.Item>
                  <div className={styles.itemGrid}>
                    <Form.Item
                      {...fieldProps}
                      name={[field.name, "quantity"]}
                      label={`Số lượng ${index + 1}`}
                      rules={[
                        { required: true, min: 1, type: "number", message: "Nhập số lượng dương" },
                      ]}
                    >
                      <InputNumber min={1} precision={0} className={styles.full} />
                    </Form.Item>
                    <Form.Item
                      {...fieldProps}
                      name={[field.name, "unitCost"]}
                      label={`Giá nhập ${index + 1}`}
                      rules={[{ min: 0, type: "number", message: "Giá nhập không âm" }]}
                    >
                      <InputNumber min={0} precision={0} className={styles.full} />
                    </Form.Item>
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<Trash2 size={16} />}
                      aria-label={`Xóa dòng ${index + 1}`}
                      onClick={() => remove(field.name)}
                    />
                  )}
                </div>
              );
            })}
            <Button type="dashed" icon={<Plus size={16} />} onClick={() => add({ quantity: 1 })}>
              Thêm sản phẩm
            </Button>
          </div>
        )}
      </Form.List>
      <Space direction="vertical" className={styles.totals}>
        <span>Tổng số lượng: {totalQuantity}</span>
        <span>Tổng giá trị tham khảo: {formatVnd(totalValue)}</span>
      </Space>
      <Button type="primary" htmlType="submit" loading={submitting}>
        Lưu bản nháp
      </Button>
    </Form>
  );
}
