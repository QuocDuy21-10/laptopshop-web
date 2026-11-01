import type { Metadata } from "next";
import { NewsletterSubscriberList } from "@/features/admin/newsletter/NewsletterSubscriberList";

export const metadata: Metadata = { title: "Đăng ký nhận tin" };

export default function AdminNewsletterPage() {
  return <NewsletterSubscriberList />;
}
