import type { Metadata } from "next";
import { Dashboard } from "@/features/admin/dashboard/Dashboard";
import { SalesSection } from "@/features/admin/dashboard/SalesSection";

export const metadata: Metadata = { title: "Tổng quan" };

export default function AdminDashboardPage() {
  return (
    <>
      <Dashboard />
      <SalesSection />
    </>
  );
}
