"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { useAfterSalesMessage } from "../hooks";
import styles from "./ServiceRequestMessages.module.scss";

export function ServiceRequestMessages({ userId, requestId, disabled = false }: { userId: number; requestId: number; disabled?: boolean }) {
  const [body, setBody] = useState("");
  const send = useAfterSalesMessage(userId, requestId);
  if (disabled) return <p>Phiếu đã đóng, không thể gửi thêm tin nhắn.</p>;
  return <form className={styles.form} onSubmit={(event) => { event.preventDefault(); if (body.trim()) { send.mutate({ body: body.trim() }, { onSuccess: () => setBody("") }); } }}><label htmlFor="after-sales-message">Tin nhắn</label><textarea id="after-sales-message" value={body} onChange={(event) => setBody(event.target.value)} maxLength={5000} /><Button type="submit" size="sm" loading={send.isPending}>Gửi tin nhắn</Button></form>;
}
