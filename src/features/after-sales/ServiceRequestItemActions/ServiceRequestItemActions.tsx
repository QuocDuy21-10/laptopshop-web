"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { useCancelAfterSalesItem, useConfirmAfterSalesItem, useDisputeAfterSalesItem } from "../hooks";
import type { AfterSalesItem } from "../types";
import styles from "./ServiceRequestItemActions.module.scss";

export function ServiceRequestItemActions({ userId, requestId, item }: { userId: number; requestId: number; item: Pick<AfterSalesItem, "id" | "status" | "version" | "allowedActions"> }) {
  const cancel = useCancelAfterSalesItem(userId, requestId, item.id);
  const confirm = useConfirmAfterSalesItem(userId, requestId, item.id);
  const dispute = useDisputeAfterSalesItem(userId, requestId, item.id);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [reason, setReason] = useState<"DEVICE_NOT_RECEIVED" | "ISSUE_PERSISTS">("ISSUE_PERSISTS");
  const [note, setNote] = useState("");
  const allowed = new Set(item.allowedActions);
  return <div className={styles.actions}>
    {allowed.has("CANCEL") && <Button size="sm" variant="secondary" onClick={() => cancel.mutate()} loading={cancel.isPending}>Hủy thiết bị</Button>}
    {allowed.has("CONFIRM") && <Button size="sm" onClick={() => confirm.mutate()} loading={confirm.isPending}>Xác nhận hoàn tất</Button>}
    {allowed.has("DISPUTE") && <Button size="sm" variant="secondary" onClick={() => setDisputeOpen((open) => !open)}>Báo vấn đề</Button>}
    {disputeOpen && <form className={styles.form} onSubmit={(event) => { event.preventDefault(); if (note.trim()) dispute.mutate({ reason, note: note.trim() }, { onSuccess: () => { setNote(""); setDisputeOpen(false); } }); }}>
      <label>Loại vấn đề<select value={reason} onChange={(event) => setReason(event.target.value as typeof reason)}><option value="ISSUE_PERSISTS">Lỗi vẫn còn</option><option value="DEVICE_NOT_RECEIVED">Chưa nhận được thiết bị</option></select></label>
      <label>Chi tiết<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} required /></label>
      <Button size="sm" type="submit" loading={dispute.isPending} disabled={!note.trim()}>Gửi tranh chấp</Button>
    </form>}
  </div>;
}
