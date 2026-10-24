"use client";

import { Button, Form, Input, InputNumber, Space } from "antd";
import { useSendAfterSalesQuote } from "./hooks";

export function ServiceQuoteEditor({ requestId, itemId, expectedVersion, deviceLabel }: { requestId: number; itemId: number; expectedVersion: number; deviceLabel: string }) {
  const send = useSendAfterSalesQuote(requestId, itemId);
  return <Form layout="vertical" initialValues={{ validDays: 7, lines: [{ description: "", quantity: 1, unitPrice: 0 }] }} onFinish={(values) => send.mutate({ expectedVersion, validDays: values.validDays, note: values.note, lines: values.lines })}>
    <Form.Item name="note" label="Ghi chú"><Input.TextArea /></Form.Item>
    <Form.Item name="validDays" label="Số ngày hiệu lực" rules={[{ required: true, type: "number", min: 1, max: 30 }]}><InputNumber min={1} max={30} /></Form.Item>
    <Form.List name="lines">{(fields, { add, remove }) => <>{fields.map((field) => <Space key={field.key} align="start"><Form.Item name={[field.name, "description"]} rules={[{ required: true, message: "Nhập hạng mục" }]}><Input placeholder="Hạng mục" /></Form.Item><Form.Item name={[field.name, "quantity"]} rules={[{ required: true, type: "number", min: 1 }]}><InputNumber min={1} /></Form.Item><Form.Item name={[field.name, "unitPrice"]} rules={[{ required: true, type: "number", min: 0 }]}><InputNumber min={0} /></Form.Item>{fields.length > 1 && <Button onClick={() => remove(field.name)}>Xóa</Button>}</Space>)}<Button onClick={() => add()} disabled={fields.length >= 50}>Thêm dòng</Button></>}</Form.List>
    <Button type="primary" htmlType="submit" loading={send.isPending}>Gửi báo giá {deviceLabel}</Button>
  </Form>;
}
