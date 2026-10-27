import { Page } from "@/components/app/Page/Page";
import { NotificationSettings } from "@/features/notifications/NotificationSettings/NotificationSettings";

export default function NotificationSettingsPage() {
  // NotificationSettings renders its own h1
  return (
    <Page>
      <NotificationSettings />
    </Page>
  );
}
