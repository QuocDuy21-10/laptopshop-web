import type { Metadata } from "next";
import { Page } from "@/components/app/Page/Page";
import { AccountProfile } from "@/features/account/AccountProfile";

export const metadata: Metadata = { title: "Hồ sơ" };

export default function AccountPage() {
  return (
    <Page title="Hồ sơ của tôi">
      <AccountProfile />
    </Page>
  );
}
