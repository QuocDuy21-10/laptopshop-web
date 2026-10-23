"use client";

import { Button, Input } from "antd";
import { useState } from "react";
import { useAdminAfterSalesNote, useAdminAfterSalesStatus } from "./hooks";

export function ServiceRequestActions({ requestId, item }: { requestId: number; item: { id: number; deviceLabel: string; status: string; version: number } }) {
  const status = useAdminAfterSalesStatus(requestId, item.id);
  const note = useAdminAfterSalesNote(requestId);
  const [body, setBody] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  return <div><select aria-label={`Trạng thái ${item.deviceLabel}`} value={item.status} onChange={(event) => status.mutate({ to: event.target.value, expectedVersion: item.version })}>{["SUBMITTED", "REVIEWING", "APPROVED", "AWAITING_ITEM", "RECEIVED", "DIAGNOSING", "IN_SERVICE", "READY_FOR_RETURN", "RETURNED", "RESOLVED", "CLOSED", "REJECTED", "CANCELLED"].map((value) => <option key={value} value={value}>{value}</option>)}</select><Button onClick={() => setNoteOpen(!noteOpen)}>Ghi chú nội bộ</Button>{noteOpen && <Input.TextArea value={body} onChange={(event) => setBody(event.target.value)} onBlur={() => { if (body.trim()) { note.mutate({ itemId: item.id, body: body.trim() }); setBody(""); } }} />}</div>;
}
