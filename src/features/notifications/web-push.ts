import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";

export const base64UrlToUint8Array = (value: string) => {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

export const registerNotificationWorker = () =>
  navigator.serviceWorker.register("/notification-sw.js", { updateViaCache: "none" });

export const subscribeCurrentBrowser = async (publicKey: string) => {
  if (!("Notification" in window) || !("serviceWorker" in navigator))
    throw new Error("PUSH_NOT_SUPPORTED");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("PUSH_PERMISSION_DENIED");
  const registration = await registerNotificationWorker();
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToUint8Array(publicKey),
  });
  await unwrap(
    api.POST("/api/v1/web-push/subscriptions", { body: subscription.toJSON() as never }),
  );
  return subscription;
};

export const unsubscribeCurrentBrowser = async (id?: number) => {
  if (id)
    await unwrap(api.DELETE("/api/v1/web-push/subscriptions/{id}", { params: { path: { id } } }));
  else await unwrap(api.DELETE("/api/v1/web-push/subscriptions"));
};
