import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/auth/AuthCard";
import { LoginForm } from "@/features/auth/LoginForm";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Đăng nhập" };

type Props = { searchParams: Promise<{ next?: string | string[]; reset?: string | string[] }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, reset } = await searchParams;
  const target = safeNext(typeof next === "string" ? next : undefined);
  return (
    <AuthCard
      title="Đăng nhập"
      footer={
        <>
          Chưa có tài khoản? <Link href={`/register?next=${encodeURIComponent(target)}`}>Đăng ký</Link>
        </>
      }
    >
      <LoginForm next={target} passwordReset={reset === "1"} />
    </AuthCard>
  );
}
