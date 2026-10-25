"use client";

import { AFTER_SALES_STATUS_LABEL } from "../labels";
import styles from "./ServiceRequestItemCard.module.scss";

export function ServiceRequestItemCard({ item }: { item: { id: number; deviceLabel: string; status: string; resolution?: string | null } }) {
  return <article className={styles.card}><h2>{item.deviceLabel}</h2><p>{AFTER_SALES_STATUS_LABEL[item.status] ?? ({ RECEIVED: "Đã nhận thiết bị", IN_SERVICE: "Đang xử lý", RETURNED: "Đã trả thiết bị", RESOLVED: "Chờ xác nhận" } as Record<string, string>)[item.status] ?? item.status}</p>{item.resolution && <p>{item.resolution}</p>}</article>;
}
