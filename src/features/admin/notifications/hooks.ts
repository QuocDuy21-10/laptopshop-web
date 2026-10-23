"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";

export type NotificationOperations = {
  activeAlerts: number;
  notifications: number;
  deadDeliveries: number;
  pendingOutbox: number;
  workers: Array<{ workerName: string; instanceId: string; status: string; lastSeenAt: string }>;
};

export function useNotificationOperations() {
  return useQuery({
    queryKey: ["admin", "notification-operations"],
    queryFn: async () =>
      (await unwrap(api.GET("/api/v1/admin/notifications/operations")))
        .data as NotificationOperations,
  });
}

export function useRetryNotificationDelivery() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      unwrap(
        api.POST("/api/v1/admin/notification-deliveries/{id}/retry", {
          params: { path: { id } },
          body: { reason },
        }),
      ),
    onSettled: () => client.invalidateQueries({ queryKey: ["admin", "notification-operations"] }),
  });
}
