import type { Metadata } from "next";
import { NotificationsView } from "@/features/notifications/NotificationsView/NotificationsView";

export const metadata: Metadata = { title: "Thông báo" };

export default function NotificationsPage() {
  return <NotificationsView />;
}
