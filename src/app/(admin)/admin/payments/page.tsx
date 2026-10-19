import type { Metadata } from "next";
import { PaymentEventList } from "@/features/admin/payments/PaymentEventList";

export const metadata: Metadata = { title: "Đối soát thanh toán" };

export default function AdminPaymentsPage() {
  return <PaymentEventList />;
}
