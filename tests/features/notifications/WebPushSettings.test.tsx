import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WebPushSettings } from "@/features/notifications/WebPushSettings/WebPushSettings";
import { renderWithQuery } from "../../utils";

vi.mock("@/features/notifications/web-push", () => ({
  registerNotificationWorker: vi.fn().mockResolvedValue({ pushManager: { subscribe: vi.fn() } }),
  subscribeCurrentBrowser: vi.fn().mockResolvedValue({ endpoint: "x" }),
  unsubscribeCurrentBrowser: vi.fn().mockResolvedValue(undefined),
}));

describe("WebPushSettings", () => {
  it("does not request permission on mount and explains denied permission", async () => {
    renderWithQuery(
      <WebPushSettings
        userId={7}
        publicKey={null}
        enabled={false}
        permission="denied"
        onEnabled={vi.fn()}
        onDisabled={vi.fn()}
      />,
    );
    expect(screen.getByText(/cài đặt trình duyệt/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bật Web Push/i })).toBeDisabled();
  });
});
