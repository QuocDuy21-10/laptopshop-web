import type { Metadata } from "next";
import { MovementList } from "@/features/admin/inventory/MovementList";

export const metadata: Metadata = { title: "Nhật ký kho" };

export default function AdminInventoryPage() {
  return <MovementList />;
}
