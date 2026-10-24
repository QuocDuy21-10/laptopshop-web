"use client";

import { Button, Form, Input, Modal, Select } from "antd";
import { useState } from "react";
import { useAdminAfterSalesNote, useAdminAfterSalesStatus, type AdminStatusBody } from "./hooks";

export function ServiceRequestActions({ requestId, item }: { requestId: number; item: { id: number; deviceLabel: string; status: string; version: number; allowedTransitions?: string[] } }) {
  const status = useAdminAfterSalesStatus(requestId, item.id);
  const note = useAdminAfterSalesNote(requestId);
  const [body, setBody] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [pendingTo, setPendingTo] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const transitions = item.allowedTransitions?.length ? item.allowedTransitions : [item.status];
  const requiresReason = pendingTo && ["REJECTED", "CLOSED"].includes(pendingTo);
  const requiresResolution = pendingTo && ["RESOLVED", "READY_FOR_RETURN"].includes(pendingTo);
  const submitTransition = () => {
    if ((requiresReason || requiresResolution) && !reason.trim()) return;
    status.mutate({ to: pendingTo as AdminStatusBody["to"], expectedVersion: item.version, ...(requiresReason ? { note: reason.trim() } : {}), ...(requiresResolution ? { resolution: reason.trim() } : {}), ...(pendingTo === "CLOSED" ? { closeMode: "ADMINISTRATIVE" as const } : {}) });
    setPendingTo(null);
    setReason("");
  };
  return <div><Select aria-label={`Trạng thái ${item.deviceLabel}`} value={item.status} options={transitions.map((value) => ({ value, label: value }))} onChange={(value) => { if (value === item.status) return; if (["REJECTED", "CLOSED", "RESOLVED", "READY_FOR_RETURN"].includes(value)) setPendingTo(value); else status.mutate({ to: value as AdminStatusBody["to"], expectedVersion: item.version }); }} /><Button onClick={() => setNoteOpen(!noteOpen)}>Ghi chú nội bộ</Button>{noteOpen && <Form onFinish={() => { if (body.trim()) { note.mutate({ itemId: item.id, body: body.trim() }); setBody(""); } }}><Input.TextArea value={body} onChange={(event) => setBody(event.target.value)} /><Button htmlType="submit">Lưu ghi chú</Button></Form>}<Modal open={Boolean(pendingTo)} title="Xác nhận chuyển trạng thái" onCancel={() => setPendingTo(null)} onOk={submitTransition} okButtonProps={{ disabled: Boolean((requiresReason || requiresResolution) && !reason.trim()) }}><Input.TextArea aria-label={requiresResolution ? "Kết quả xử lý" : "Lý do"} value={reason} onChange={(event) => setReason(event.target.value)} placeholder={requiresResolution ? "Nhập kết quả xử lý" : "Nhập lý do"} /></Modal></div>;
}
