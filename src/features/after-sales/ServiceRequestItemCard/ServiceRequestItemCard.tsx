"use client";

import { labelOf } from "@/lib/labels";
import { AFTER_SALES_ITEM_STATUS_LABEL } from "../labels";
import styles from "./ServiceRequestItemCard.module.scss";

export function ServiceRequestItemCard({ item }: { item: { id: number; deviceLabel: string; status: string; resolution?: string | null } }) {
  return <article className={styles.card}><h2>{item.deviceLabel}</h2><p>{labelOf(AFTER_SALES_ITEM_STATUS_LABEL, item.status)}</p>{item.resolution && <p>{item.resolution}</p>}</article>;
}
