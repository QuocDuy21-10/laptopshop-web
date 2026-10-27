import { describe, expect, it, vi } from "vitest";
import {
  base64UrlToUint8Array,
  registerNotificationWorker,
  subscribeCurrentBrowser,
} from "@/features/notifications/web-push";

describe("web push helpers", () => {
  it("converts VAPID base64url keys", () => {
    expect(Array.from(base64UrlToUint8Array("AQID"))).toEqual([1, 2, 3]);
  });

  it("does not prompt permission during service worker registration", async () => {
    const register = vi.fn().mockResolvedValue({});
    Object.defineProperty(globalThis.navigator, "serviceWorker", {
      value: { register },
      configurable: true,
    });
    Object.defineProperty(globalThis, "Notification", {
      value: { permission: "default", requestPermission: vi.fn() },
      configurable: true,
    });
    await registerNotificationWorker();
    expect(register).toHaveBeenCalledWith("/notification-sw.js", { updateViaCache: "none" });
    expect(Notification.requestPermission).not.toHaveBeenCalled();
  });

  it("requests permission only when subscribing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 1 } }), { status: 201 }),
    );
    const subscribe = vi
      .fn()
      .mockResolvedValue({ endpoint: "x", toJSON: () => ({ endpoint: "x" }) });
    const register = vi.fn().mockResolvedValue({ pushManager: { subscribe } });
    Object.defineProperty(globalThis.navigator, "serviceWorker", {
      value: { register },
      configurable: true,
    });
    Object.defineProperty(globalThis, "Notification", {
      value: { permission: "default", requestPermission: vi.fn().mockResolvedValue("granted") },
      configurable: true,
    });
    await subscribeCurrentBrowser("public-key");
    expect(Notification.requestPermission).toHaveBeenCalledTimes(1);
    expect(subscribe).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
