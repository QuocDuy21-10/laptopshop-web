"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button/Button";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { useMarkAllNotificationsRead, useMarkNotificationRead } from "@/features/notifications/hooks";
import { errorMessage } from "@/lib/api/errors";
import { formatDate, formatVnd } from "@/lib/format";
import type { InAppNotification } from "@/lib/api/types";
import styles from "./NotificationList.module.scss";

export function NotificationList({ userId, items, unreadCount, page = 1, totalPages = 1 }: { userId: number; items: InAppNotification[]; unreadCount: number; page?: number; totalPages?: number }) {
  const router = useRouter();
  const read = useMarkNotificationRead(userId);
  const readAll = useMarkAllNotificationsRead(userId);
  return <section className={styles.list} aria-label="Danh sách thông báo"><Button variant="secondary" disabled={unreadCount === 0 || readAll.isPending} onClick={() => readAll.mutate()}>Đánh dấu tất cả đã đọc</Button>{items.map((item) => <button key={item.id} type="button" className={styles.item} aria-label={`${item.message}${item.readAt ? " đã đọc" : " chưa đọc"}`} data-read={Boolean(item.readAt)} onClick={() => { const serviceRequestId = (item as InAppNotification & { serviceRequestId?: number | null }).serviceRequestId; const destination = serviceRequestId ? `/account/after-sales/${serviceRequestId}` : item.productId ? `/products/${item.productId}` : null; void Promise.resolve().then(() => read.mutateAsync(item.id)).catch((error: unknown) => toast.error(errorMessage(error))); if (destination) router.push(destination); }}><strong>{item.title}</strong><span>{item.message}</span><small>{item.oldPrice && item.newPrice ? `${formatVnd(item.oldPrice)} → ${formatVnd(item.newPrice)} · ` : ""}{formatDate(item.createdAt)}</small></button>)}<Pagination page={page} totalPages={totalPages} hrefFor={(next) => `/account/notifications?page=${next}`} /></section>;
}
