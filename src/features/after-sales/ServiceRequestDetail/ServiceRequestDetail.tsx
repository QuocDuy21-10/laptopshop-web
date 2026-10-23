"use client";

import Link from "next/link";
import { Alert } from "@/components/ui/Alert/Alert";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { errorMessage } from "@/lib/api/errors";
import { useAfterSalesRequest } from "../hooks";
import { AFTER_SALES_STATUS_LABEL } from "../labels";
import { ServiceRequestItemCard } from "../ServiceRequestItemCard/ServiceRequestItemCard";
import { ServiceRequestTimeline } from "../ServiceRequestTimeline/ServiceRequestTimeline";
import styles from "./ServiceRequestDetail.module.scss";

type DetailItem = { id: number; deviceLabel: string; status: string; resolution?: string | null; quotes?: unknown[] };
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
    <section className={styles.items}>{data.items.map((item) => <ServiceRequestItemCard key={item.id} item={item} />)}</section>
    <ServiceRequestTimeline events={data.events ?? []} />
    {data.followUps && data.followUps.length > 0 && <nav><strong>Yêu cầu tiếp theo</strong>{data.followUps.map((item) => <Link key={item.id} href={`/account/after-sales/${item.id}`}>{item.code}</Link>)}</nav>}
  </div>;
}
