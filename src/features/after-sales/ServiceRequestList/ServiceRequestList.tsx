"use client";

import Link from "next/link";
import { Alert } from "@/components/ui/Alert/Alert";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { errorMessage } from "@/lib/api/errors";
import { useAfterSalesRequests } from "../hooks";
import { AFTER_SALES_STATUS_LABEL } from "../labels";
import styles from "./ServiceRequestList.module.scss";

export function ServiceRequestList({ userId, page }: { userId: number; page: number }) {
  const requests = useAfterSalesRequests(userId, page);
  if (requests.isPending) return <Skeleton className={styles.skeleton} />;
  if (requests.isError) return <Alert tone="error" title={errorMessage(requests.error)} />;
  if (!requests.data.data.length) return <p>Chưa có yêu cầu hậu mãi.</p>;
  return <>
    <ul className={styles.list}>{(requests.data.data as Array<{ id: number; code: string; subject: string; status: string }>).map((item) => <li key={item.id}><Link href={`/account/after-sales/${item.id}`} className={styles.row}><strong>{item.code}</strong><span>{item.subject}</span><em>{AFTER_SALES_STATUS_LABEL[item.status] ?? item.status}</em></Link></li>)}</ul>
    <Pagination page={page} totalPages={requests.data.meta.totalPages} hrefFor={(next) => `/account/after-sales?page=${next}`} />
  </>;
}
