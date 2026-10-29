"use client";

import Link from "next/link";
import { useMe } from "@/features/account/useMe";
import { useNotifications, useUnreadNotificationCount } from "../hooks";
import { NotificationEmptyState } from "../NotificationEmptyState/NotificationEmptyState";
import { NotificationList } from "../NotificationList/NotificationList";
import { Page } from "@/components/app/Page/Page";
import { Alert } from "@/components/ui/Alert/Alert";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { errorMessage } from "@/lib/api/errors";

export function NotificationsView() {
  const me = useMe();
  const page =
    typeof window === "undefined"
      ? 1
      : Math.max(1, Number(new URLSearchParams(window.location.search).get("page") ?? 1));
  const list = useNotifications(me.data?.id, page);
  const count = useUnreadNotificationCount(me.data?.id);
  const settingsLink = <Link href="/account/notifications/settings">Cài đặt thông báo</Link>;
  let content;
  if (me.isPending || list.isPending || count.isPending) content = <Skeleton />;
  else if (me.isError || list.isError || count.isError)
    content = <Alert tone="error" title={errorMessage(me.error ?? list.error ?? count.error)} />;
  else if (!list.data || list.data.data.length === 0) content = <NotificationEmptyState />;
  else
    content = (
      <NotificationList
        userId={me.data!.id}
        items={list.data.data}
        unreadCount={count.data?.unreadCount ?? 0}
        page={list.data.meta.page}
        totalPages={list.data.meta.totalPages}
      />
    );
  return (
    <Page title="Thông báo" actions={settingsLink}>
      {content}
    </Page>
  );
}
