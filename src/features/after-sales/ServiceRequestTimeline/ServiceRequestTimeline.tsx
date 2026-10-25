"use client";

import styles from "./ServiceRequestTimeline.module.scss";

export function ServiceRequestTimeline({ events }: { events: Array<{ id: number; kind: string; body?: string | null; createdAt: string }> }) {
  return <ol className={styles.timeline}>{events.map((event) => <li key={event.id}><time>{new Date(event.createdAt).toLocaleString("vi-VN")}</time><strong>{event.kind === "PUBLIC_MESSAGE" ? "Tin nhắn" : event.kind}</strong>{event.body && <p>{event.body}</p>}</li>)}</ol>;
}
