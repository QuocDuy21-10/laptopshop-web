"use client";

import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { errorMessage } from "@/lib/api/errors";
import { useDecideAfterSalesQuote } from "../hooks";
import styles from "./ServiceQuoteCard.module.scss";

export function ServiceQuoteCard({ userId, requestId, itemId, quote, deviceLabel, canDecide = false }: { userId: number; requestId: number; itemId: number; canDecide?: boolean; quote: { id: number; version: number; status: string; total: number; currency: string; validUntil: string; note?: string | null; respondedAt?: string | null; lines: Array<{ id: number; description: string; quantity: number; unitPrice: number; lineTotal: number }> }; deviceLabel: string }) {
  const decide = useDecideAfterSalesQuote(userId, requestId, itemId, quote.id);
  const active = canDecide && quote.status === "SENT" && new Date(quote.validUntil) > new Date();
  return <article className={styles.card}><h3>Báo giá phiên bản {quote.version} — {deviceLabel}</h3><p>Trạng thái: {quote.status} · Hạn quyết định: {new Date(quote.validUntil).toLocaleString("vi-VN")}</p><table><thead><tr><th>Hạng mục</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>{quote.lines.map((line) => <tr key={line.id}><td>{line.description}</td><td>{line.quantity}</td><td>{line.unitPrice.toLocaleString("vi-VN")}đ</td><td>{line.lineTotal.toLocaleString("vi-VN")}đ</td></tr>)}</tbody></table><strong>{quote.total.toLocaleString("vi-VN")} {quote.currency}</strong>{quote.note && <p>{quote.note}</p>}{quote.respondedAt && <p>Đã phản hồi: {new Date(quote.respondedAt).toLocaleString("vi-VN")}</p>}{active ? <div className={styles.actions}><Button size="sm" onClick={() => decide.mutate("ACCEPT")} loading={decide.isPending} aria-label={`Chấp nhận báo giá ${deviceLabel}`}>Chấp nhận</Button><Button size="sm" variant="secondary" onClick={() => decide.mutate("DECLINE")} disabled={decide.isPending} aria-label={`Từ chối báo giá ${deviceLabel}`}>Từ chối</Button>{decide.isError && <Alert tone="error" title={errorMessage(decide.error)} />}</div> : <p>Báo giá không còn hiệu lực.</p>}</article>;
}
