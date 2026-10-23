"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { InAppNotification, NotificationPage, NotificationPreferences } from "@/lib/api/types";

export type NotificationOptimisticContext = {
  listEntries: Array<[readonly unknown[], NotificationPage | undefined]>;
  unreadCount: { unreadCount: number } | undefined;
};

function useVisible() {
  const [visible, setVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState === "visible",
  );
  useEffect(() => {
    const handler = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);
  return visible;
}

export function useNotifications(
  userId: number | undefined,
  page: number,
): UseQueryResult<NotificationPage> {
  return useQuery({
    queryKey: userId ? queryKeys.notifications(userId, page) : ["notifications", "anonymous", page],
    enabled: userId !== undefined,
    queryFn: () =>
      unwrap(api.GET("/api/v1/notifications", { params: { query: { page, pageSize: 10 } } })),
  });
}

export function useUnreadNotificationCount(
  userId: number | undefined,
): UseQueryResult<{ unreadCount: number }> {
  const visible = useVisible();
  return useQuery({
    queryKey: userId
      ? queryKeys.notificationUnreadCount(userId)
      : ["notifications", "anonymous", "unread-count"],
    enabled: userId !== undefined,
    refetchInterval: userId !== undefined && visible ? 60_000 : false,
    queryFn: async () => (await unwrap(api.GET("/api/v1/notifications/unread-count"))).data,
  });
}

export function useNotificationPreferences(userId: number | undefined) {
  return useQuery({
    queryKey: userId
      ? queryKeys.notificationPreferences(userId)
      : ["notifications", "anonymous", "preferences"],
    enabled: userId !== undefined,
    queryFn: async () =>
      (await unwrap(api.GET("/api/v1/notification-preferences"))).data as NotificationPreferences,
  });
}

export function useUpdateNotificationPreferences(userId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { emailEnabled?: boolean; webPushEnabled?: boolean }) =>
      unwrap(api.PATCH("/api/v1/notification-preferences", { body: input })),
    onSuccess: () => {
      if (userId !== undefined) {
        void client.invalidateQueries({ queryKey: queryKeys.notificationPreferences(userId) });
        void client.invalidateQueries({ queryKey: queryKeys.me });
      }
    },
  });
}

export function useRequestEmailOtp() {
  return useMutation({
    mutationFn: () => unwrap(api.POST("/api/v1/me/email-verification/request")),
  });
}

export function useConfirmEmailOtp(userId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (code: string) =>
      unwrap(api.POST("/api/v1/me/email-verification/confirm", { body: { code } })),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.me });
      if (userId !== undefined)
        void client.invalidateQueries({ queryKey: queryKeys.notificationPreferences(userId) });
    },
  });
}

const getListEntries = (client: ReturnType<typeof useQueryClient>, userId: number) =>
  client
    .getQueriesData<NotificationPage>({ queryKey: queryKeys.notificationsAll(userId) })
    .filter(([key]) => key[2] === "list");

export function useMarkNotificationRead(
  userId: number | undefined,
): UseMutationResult<{ data: InAppNotification }, ApiError, number, NotificationOptimisticContext> {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap(api.PATCH("/api/v1/notifications/{id}/read", { params: { path: { id } } })),
    onMutate: async (id) => {
      if (userId === undefined) return { listEntries: [], unreadCount: undefined };
      await client.cancelQueries({ queryKey: queryKeys.notificationsAll(userId) });
      const context = {
        listEntries: getListEntries(client, userId),
        unreadCount: client.getQueryData<{ unreadCount: number }>(
          queryKeys.notificationUnreadCount(userId),
        ),
      };
      for (const [key, value] of context.listEntries)
        if (value)
          client.setQueryData(key, {
            ...value,
            data: value.data.map((item) =>
              item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
            ),
          });
      if (context.unreadCount)
        client.setQueryData(queryKeys.notificationUnreadCount(userId), {
          unreadCount: Math.max(0, context.unreadCount.unreadCount - 1),
        });
      return context;
    },
    onError: (_error, _id, context) => {
      if (!context || userId === undefined) return;
      for (const [key, value] of context.listEntries) client.setQueryData(key, value);
      client.setQueryData(queryKeys.notificationUnreadCount(userId), context.unreadCount);
    },
    onSettled: () => {
      if (userId !== undefined)
        void client.invalidateQueries({ queryKey: queryKeys.notificationsAll(userId) });
    },
  });
}

export function useMarkAllNotificationsRead(
  userId: number | undefined,
): UseMutationResult<
  { data: { updatedCount: number } },
  ApiError,
  void,
  NotificationOptimisticContext
> {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(api.PATCH("/api/v1/notifications/read-all")),
    onMutate: async () => {
      if (userId === undefined) return { listEntries: [], unreadCount: undefined };
      await client.cancelQueries({ queryKey: queryKeys.notificationsAll(userId) });
      const context = {
        listEntries: getListEntries(client, userId),
        unreadCount: client.getQueryData<{ unreadCount: number }>(
          queryKeys.notificationUnreadCount(userId),
        ),
      };
      for (const [key, value] of context.listEntries)
        if (value)
          client.setQueryData(key, {
            ...value,
            data: value.data.map((item) => ({
              ...item,
              readAt: item.readAt ?? new Date().toISOString(),
            })),
          });
      if (context.unreadCount)
        client.setQueryData(queryKeys.notificationUnreadCount(userId), { unreadCount: 0 });
      return context;
    },
    onError: (_error, _input, context) => {
      if (!context || userId === undefined) return;
      for (const [key, value] of context.listEntries) client.setQueryData(key, value);
      client.setQueryData(queryKeys.notificationUnreadCount(userId), context.unreadCount);
    },
    onSettled: () => {
      if (userId !== undefined)
        void client.invalidateQueries({ queryKey: queryKeys.notificationsAll(userId) });
    },
  });
}
