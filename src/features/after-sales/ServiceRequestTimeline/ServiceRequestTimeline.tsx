"use client";

import { labelOf } from "@/lib/labels";
import { AFTER_SALES_EVENT_FALLBACK, AFTER_SALES_EVENT_LABEL } from "../labels";
import styles from "./ServiceRequestTimeline.module.scss";

export function ServiceRequestTimeline({ events }: { events: Array<{ id: number; kind: string; body?: string | null; createdAt: string }> }) {
  return <ol className={styles.timeline}>{events.map((event) => <li key={event.id}><time>{new Date(event.createdAt).toLocaleString("vi-VN")}</time><strong>{labelOf(AFTER_SALES_EVENT_LABEL, event.kind, AFTER_SALES_EVENT_FALLBACK)}</strong>{event.body && <p>{event.body}</p>}</li>)}</ol>;
}
