self.addEventListener("push", (event) => {
  let payload;
  try { payload = event.data ? event.data.json() : null; } catch { payload = null; }
  if (!payload || typeof payload.title !== "string" || typeof payload.body !== "string") return;
  const url = typeof payload.url === "string" && (/^\/products\/\d+/.test(payload.url) || payload.url.startsWith("/account/notifications")) ? payload.url : "/account/notifications";
  event.waitUntil(self.registration.showNotification(payload.title, {
    body: payload.body,
    tag: typeof payload.tag === "string" ? payload.tag.slice(0, 32) : "laptopshop-notification",
    renotify: false,
    data: { url },
  }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/account/notifications";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    const current = windows.find((client) => client.url.endsWith(url));
    if (current) return current.focus();
    return clients.openWindow(url);
  }));
});
