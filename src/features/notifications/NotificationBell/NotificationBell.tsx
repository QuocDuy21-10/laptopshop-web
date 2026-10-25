"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useUnreadNotificationCount } from "@/features/notifications/hooks";
import { useMe } from "@/features/account/useMe";
import styles from "./NotificationBell.module.scss";

export function NotificationBell({ userId }: { userId?: number }) {
  const me = useMe();
  const effectiveUserId = userId ?? me.data?.id;
  const query = useUnreadNotificationCount(effectiveUserId);
  if (effectiveUserId === undefined) return null;
  const count = query.data?.unreadCount ?? 0;
  return <Link href="/account/notifications" className={styles.link} aria-label={`Thông báo${count ? ` (${count})` : ""}`}><Bell size={20} aria-hidden="true" />{count > 0 && <span className={styles.badge}>{count > 99 ? "99+" : count}</span>}</Link>;
}
