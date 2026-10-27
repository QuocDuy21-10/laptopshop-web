import type { Metadata } from "next";
import { PaymentEventList } from "@/features/admin/payments/PaymentEventList";
import { PaymentReviewCaseList } from "@/features/admin/payments/PaymentReviewCaseList";
import { Tabs } from "antd";

export const metadata: Metadata = { title: "Đối soát thanh toán" };

export default function AdminPaymentsPage() {
  return <Tabs items={[{ key: "events", label: "Giao dịch bất thường", children: <PaymentEventList /> }, { key: "cases", label: "Đơn chờ xác minh", children: <PaymentReviewCaseList /> }]} />;
}
