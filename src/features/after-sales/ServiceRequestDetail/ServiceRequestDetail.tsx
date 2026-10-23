"use client";

import Link from "next/link";
import { Alert } from "@/components/ui/Alert/Alert";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { errorMessage } from "@/lib/api/errors";
import { useAfterSalesRequest } from "../hooks";
import { AFTER_SALES_STATUS_LABEL } from "../labels";
import { ServiceRequestItemCard } from "../ServiceRequestItemCard/ServiceRequestItemCard";
import { ServiceRequestTimeline } from "../ServiceRequestTimeline/ServiceRequestTimeline";
import { ServiceRequestMessages } from "../ServiceRequestMessages/ServiceRequestMessages";
import { ServiceQuoteCard } from "../ServiceQuoteCard/ServiceQuoteCard";
import styles from "./ServiceRequestDetail.module.scss";

type QuoteView = { id: number; version: number; status: string; total: number; currency: string; validUntil: string; note?: string | null; lines: unknown[] };
type DetailItem = { id: number; deviceLabel: string; status: string; resolution?: string | null; quotes?: QuoteView[] };
type DetailEvent = { id: number; kind: string; body?: string | null; createdAt: string };
type DetailData = { code: string; subject: string; status: string; previousRequest?: { id: number; code: string } | null; followUps?: Array<{ id: number; code: string }>; items: DetailItem[]; events: DetailEvent[] };

export function ServiceRequestDetail({ userId, id }: { userId: number; id: number }) {
  const request = useAfterSalesRequest(userId, id);
  if (request.isPending) return <Skeleton className={styles.skeleton} />;
  if (request.isError) return <Alert tone="error" title={errorMessage(request.error)} />;
  const data = request.data.data as unknown as DetailData;
  return <div className={styles.detail}>
    <header><p className={styles.code}>{data.code}</p><h1>{data.subject}</h1><p>{AFTER_SALES_STATUS_LABEL[data.status] ?? data.status}</p></header>
    {data.previousRequest && <p><Link href={`/account/after-sales/${data.previousRequest.id}`}>Tiếp nối từ {data.previousRequest.code}</Link></p>}
    <section className={styles.items}>{data.items.map((item) => <div key={item.id}><ServiceRequestItemCard item={item} />{item.quotes?.filter((quote) => quote.status === "SENT").map((quote) => <ServiceQuoteCard key={quote.id} userId={userId} requestId={id} itemId={item.id} quote={quote} deviceLabel={item.deviceLabel} />)}</div>)}</section>
    <ServiceRequestTimeline events={data.events ?? []} />
    <ServiceRequestMessages userId={userId} requestId={id} />
    {data.followUps && data.followUps.length > 0 && <nav><strong>Yêu cầu tiếp theo</strong>{data.followUps.map((item) => <Link key={item.id} href={`/account/after-sales/${item.id}`}>{item.code}</Link>)}</nav>}
  </div>;
}
