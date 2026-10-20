"use client";

import { App } from "antd";
import { useRouter } from "next/navigation";
import { ReceiptForm } from "@/features/admin/inventory/ReceiptForm";
import { useCreateReceipt } from "@/features/admin/inventory/hooks";

export default function NewReceiptPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const create = useCreateReceipt();
  return (
    <ReceiptForm
      submitting={create.isPending}
      onSubmit={async (body) => {
        const result = await create.mutateAsync(body);
        message.success("Đã lưu phiếu nhập");
        router.push(`/admin/inventory/receipts/${result.data.id}`);
      }}
    />
  );
}
