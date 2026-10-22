"use client";

import { useMe } from "@/features/account/useMe";
import { useNotifications, useUnreadNotificationCount } from "@/features/notifications/hooks";
import { NotificationEmptyState } from "@/features/notifications/NotificationEmptyState/NotificationEmptyState";
import { NotificationList } from "@/features/notifications/NotificationList/NotificationList";
import { Alert } from "@/components/ui/Alert/Alert";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { errorMessage } from "@/lib/api/errors";

export default function NotificationsPage() {
  const me = useMe();
  const list = useNotifications(me.data?.id, 1);
  const count = useUnreadNotificationCount(me.data?.id);
  if (me.isPending || list.isPending || count.isPending) return <Skeleton />;
  if (me.isError || list.isError || count.isError) return <Alert tone="error" title={errorMessage(me.error ?? list.error ?? count.error)} />;
  if (!list.data || list.data.data.length === 0) return <NotificationEmptyState />;
  return <NotificationList userId={me.data!.id} items={list.data.data} unreadCount={count.data?.unreadCount ?? 0} />;
}
