import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserDetail } from "@/features/admin/users/UserDetail";

export const metadata: Metadata = { title: "Chi tiết khách hàng" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminUserPage({ params }: Props) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <UserDetail id={id} />;
}
