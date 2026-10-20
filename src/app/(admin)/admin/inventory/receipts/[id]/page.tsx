"use client";

import { useParams } from "next/navigation";
import { ReceiptDetail } from "@/features/admin/inventory/ReceiptDetail";

export default function ReceiptDetailPage() {
  const params = useParams<{ id: string }>();
  return <ReceiptDetail id={params.id} />;
}
