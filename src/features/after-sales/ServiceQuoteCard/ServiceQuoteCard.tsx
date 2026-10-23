"use client";

import { Button } from "@/components/ui/Button/Button";
import { useDecideAfterSalesQuote } from "../hooks";
import styles from "./ServiceQuoteCard.module.scss";

export function ServiceQuoteCard({ userId, requestId, itemId, quote, deviceLabel }: { userId: number; requestId: number; itemId: number; quote: { id: number; version: number; status: string; total: number; currency: string; validUntil: string; note?: string | null; lines: unknown[] }; deviceLabel: string }) {
  const decide = useDecideAfterSalesQuote(userId, requestId, itemId, quote.id);
  const active = quote.status === "SENT" && new Date(quote.validUntil) > new Date();
  return <article className={styles.card}><h3>Báo giá — {deviceLabel}</h3><strong>{quote.total.toLocaleString("vi-VN")} {quote.currency}</strong>{quote.note && <p>{quote.note}</p>}{active ? <div className={styles.actions}><Button size="sm" onClick={() => decide.mutate("ACCEPT")} loading={decide.isPending} aria-label={`Chấp nhận báo giá ${deviceLabel}`}>Chấp nhận</Button><Button size="sm" variant="secondary" onClick={() => decide.mutate("DECLINE")} disabled={decide.isPending} aria-label={`Từ chối báo giá ${deviceLabel}`}>Từ chối</Button></div> : <p>Báo giá không còn hiệu lực.</p>}</article>;
}
