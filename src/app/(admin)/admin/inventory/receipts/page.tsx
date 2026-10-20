import type { Metadata } from "next";
import { ReceiptList } from "@/features/admin/inventory/ReceiptList";

export const metadata: Metadata = { title: "Phiếu nhập kho" };

export default function AdminReceiptListPage() {
  return <ReceiptList />;
}
