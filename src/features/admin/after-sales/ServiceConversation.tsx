"use client";
export function ServiceConversation({ events }: { events: Array<{ id: number; kind: string; body?: string | null }> }) { return <div>{events.map((event) => <article key={event.id}><strong>{event.kind === "INTERNAL_NOTE" ? "Ghi chú nội bộ" : "Trao đổi công khai"}</strong><p>{event.body}</p></article>)}</div>; }
