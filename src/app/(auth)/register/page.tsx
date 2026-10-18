import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/AuthCard";
import { RegisterForm } from "@/features/auth/RegisterForm";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Đăng ký" };

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const target = safeNext(typeof next === "string" ? next : undefined);
  return (
    <AuthCard
      title="Tạo tài khoản"
      footer={
        <>
          Đã có tài khoản? <Link href={`/login?next=${encodeURIComponent(target)}`}>Đăng nhập</Link>
        </>
      }
    >
      <RegisterForm next={target} />
    </AuthCard>
  );
}
