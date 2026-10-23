"use client";

import { Button, Input, InputNumber } from "antd";
import { useState } from "react";
import { useSendAfterSalesQuote } from "./hooks";

export function ServiceQuoteEditor({ requestId, itemId, expectedVersion, deviceLabel }: { requestId: number; itemId: number; expectedVersion: number; deviceLabel: string }) {
  const send = useSendAfterSalesQuote(requestId, itemId);
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  return <div><Input placeholder="Hạng mục" value={description} onChange={(event) => setDescription(event.target.value)} /><InputNumber min={1} value={quantity} onChange={(value) => setQuantity(value ?? 1)} /><InputNumber min={0} value={unitPrice} onChange={(value) => setUnitPrice(value ?? 0)} /><Button type="primary" onClick={() => send.mutate({ expectedVersion, validDays: 7, lines: [{ description: description || "Hạng mục dịch vụ", quantity, unitPrice }] })}>Gửi báo giá {deviceLabel}</Button></div>;
}
