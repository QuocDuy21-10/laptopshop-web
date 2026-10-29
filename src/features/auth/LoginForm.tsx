"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { TextField } from "@/components/ui/TextField/TextField";
import { errorMessage } from "@/lib/api/errors";
import { readPendingCartIntent } from "@/features/cart/intent";
import { applyFieldErrors } from "@/lib/forms";
import { useLogin } from "./hooks";
import { loginSchema, type LoginInput } from "./schemas";
import styles from "./AuthForm.module.scss";

const noopSubscribe = () => () => {};

export function LoginForm({ next, passwordReset = false }: { next: string; passwordReset?: boolean }) {
  const router = useRouter();
  const login = useLogin();
  const [formError, setFormError] = useState<string | null>(null);
  // sessionStorage is client-only: the server snapshot is false, so hydration stays consistent
  const hasCartIntent = useSyncExternalStore(noopSubscribe, () => readPendingCartIntent() !== null, () => false);
  const { register, handleSubmit, setError, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login.mutateAsync(values);
      router.replace(next);
      router.refresh();
    } catch (e) {
      if (!applyFieldErrors(e, setError)) setFormError(errorMessage(e));
    }
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {passwordReset && <Alert tone="success" title="Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới." />}
      {hasCartIntent && <Alert tone="info" title="Đăng nhập để thêm sản phẩm vào giỏ hàng." />}
      {formError && <Alert tone="error" title={formError} />}
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={formState.errors.username?.message}
        {...register("username")}
      />
      <TextField
        label="Mật khẩu"
        type="password"
        autoComplete="current-password"
        required
        error={formState.errors.password?.message}
        {...register("password")}
      />
      <Link href="/forgot-password" className={styles.forgot}>
        Quên mật khẩu?
      </Link>
      <Button type="submit" size="lg" fullWidth loading={login.isPending}>
        Đăng nhập
      </Button>
    </form>
  );
}
