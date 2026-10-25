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
          isStale: false,
        },
        { workerName: "price-alert-worker", instanceId: "old", status: "HEALTHY", lastSeenAt: "2026-10-22T00:00:00Z", isStale: true },
      ],
      priceAlertSweep: {
        checkpointProductId: 42,
        cycleStartedAt: "2026-10-23T00:00:00Z",
        lastStartedAt: "2026-10-23T00:00:00Z",
        lastCompletedAt: "2026-10-23T00:01:00Z",
        lastSucceededAt: "2026-10-23T00:01:00Z",
        lastDurationMs: 1200,
        consecutiveFailures: 2,
        lastErrorCode: "BATCH_ERROR",
        lastStats: { productsScanned: 4, itemsEvaluated: 8, notificationsCreated: 2, duplicatesSkipped: 3, invalidStatesSkipped: 1, errors: 1 },
        updatedAt: "2026-10-23T00:01:00Z",
      },
    },
  }),
}));

describe("NotificationOperations", () => {
  it("shows sanitized operations metrics and heartbeat", () => {
    renderAdmin(<NotificationOperations />);
    expect(screen.getByText("Notification Operations")).toBeInTheDocument();
    expect(screen.getByText("Outbox pending")).toBeInTheDocument();
    expect(screen.getByText(/notification-worker/)).toBeInTheDocument();
    expect(screen.getByText(/Checkpoint product: 42/i)).toBeInTheDocument();
    expect(screen.getByText(/Products scanned: 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Duplicates skipped: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Invalid states skipped: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Last error: BATCH_ERROR/i)).toBeInTheDocument();
    expect(screen.getByText(/price-alert-worker.*stale/i)).toBeInTheDocument();
    expect(screen.queryByText(/endpoint|otp|p256dh/i)).not.toBeInTheDocument();
  });
});
