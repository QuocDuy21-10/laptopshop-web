import type { NewsletterSubscriber } from "@/lib/api/types";

export const statusLabel: Record<NewsletterSubscriber["status"], string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  UNSUBSCRIBED: "Đã hủy",
};

export const statusColor: Record<NewsletterSubscriber["status"], "success" | "warning" | "default"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  UNSUBSCRIBED: "default",
};
