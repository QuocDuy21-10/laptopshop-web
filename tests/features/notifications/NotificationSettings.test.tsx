import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationSettings } from "@/features/notifications/NotificationSettings/NotificationSettings";
import { renderWithQuery } from "../../utils";

vi.mock("@/features/account/useMe", () => ({
  useMe: () => ({
    data: { id: 7, username: "a@test.local", emailVerifiedAt: null },
    isPending: false,
  }),
}));
vi.mock("@/features/notifications/hooks", () => ({
  useNotificationPreferences: () => ({
    data: { inAppEnabled: true, emailEnabled: false, webPushEnabled: false },
    isPending: false,
  }),
  useWebPushConfig: () => ({ data: { enabled: false, publicKey: null }, isPending: false }),
  useUpdateNotificationPreferences: () => ({ mutate: vi.fn(), error: null }),
  useRequestEmailOtp: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useConfirmEmailOtp: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe("NotificationSettings", () => {
  it("keeps In-App enabled and shows explicit external opt-ins", () => {
    renderWithQuery(<NotificationSettings />);
    expect(screen.getByLabelText("In-App luôn bật")).toBeDisabled();
    expect(screen.getByLabelText("Email")).not.toBeChecked();
    expect(screen.getByRole("button", { name: /Bật Web Push/i })).toBeDisabled();
  });
});
