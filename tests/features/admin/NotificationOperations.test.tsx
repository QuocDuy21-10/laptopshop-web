import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationOperations } from "@/features/admin/notifications/NotificationOperations";
import { renderAdmin } from "../../utils";

vi.mock("@/features/admin/notifications/hooks", () => ({
  useNotificationOperations: () => ({
    isPending: false,
    data: {
      activeAlerts: 4,
      notifications: 8,
      deadDeliveries: 2,
      pendingOutbox: 3,
      workers: [
        {
          workerName: "notification-worker",
          instanceId: "1",
          status: "HEALTHY",
          lastSeenAt: "2026-10-23T00:00:00Z",
        },
      ],
    },
  }),
}));

describe("NotificationOperations", () => {
  it("shows sanitized operations metrics and heartbeat", () => {
    renderAdmin(<NotificationOperations />);
    expect(screen.getByText("Notification Operations")).toBeInTheDocument();
    expect(screen.getByText("Outbox pending")).toBeInTheDocument();
    expect(screen.getByText(/notification-worker/)).toBeInTheDocument();
    expect(screen.queryByText(/endpoint|otp|p256dh/i)).not.toBeInTheDocument();
  });
});
