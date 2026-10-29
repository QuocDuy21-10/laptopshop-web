import type { Metadata } from "next";
import { Page } from "@/components/app/Page/Page";
import { NotificationSettings } from "@/features/notifications/NotificationSettings/NotificationSettings";

export const metadata: Metadata = { title: "Cài đặt thông báo" };

export default function NotificationSettingsPage() {
  // NotificationSettings renders its own h1
  return (
    <Page>
      <NotificationSettings />
    </Page>
  );
}
