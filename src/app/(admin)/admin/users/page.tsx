import type { Metadata } from "next";
import { UserList } from "@/features/admin/users/UserList";

export const metadata: Metadata = { title: "Người dùng" };

export default function AdminUsersPage() {
  return <UserList />;
}
