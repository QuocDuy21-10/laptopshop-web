import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminGuard } from "@/features/admin/AdminGuard";
import { AdminProviders } from "@/features/admin/AdminProviders";
import { AdminShell } from "@/features/admin/AdminShell/AdminShell";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s | Quản trị LaptopShop" },
  robots: { index: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <AdminProviders>
        <AdminGuard>
          <AdminShell>{children}</AdminShell>
        </AdminGuard>
      </AdminProviders>
    </AntdRegistry>
  );
}
