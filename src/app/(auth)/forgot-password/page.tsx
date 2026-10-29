import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/AuthCard";
import { ForgotPasswordFlow } from "@/features/auth/ForgotPasswordFlow";

export const metadata: Metadata = { title: "Quên mật khẩu" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Quên mật khẩu" footer={<Link href="/login">Quay lại đăng nhập</Link>}>
      <ForgotPasswordFlow />
    </AuthCard>
  );
}
