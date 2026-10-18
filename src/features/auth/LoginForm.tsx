"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { TextField } from "@/components/ui/TextField/TextField";
import { errorMessage } from "@/lib/api/errors";
import { applyFieldErrors } from "@/lib/forms";
import { useLogin } from "./hooks";
import { loginSchema, type LoginInput } from "./schemas";
import styles from "./AuthForm.module.scss";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const login = useLogin();
  const [formError, setFormError] = useState<string | null>(null);
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
      <Button type="submit" size="lg" fullWidth loading={login.isPending}>
        Đăng nhập
      </Button>
    </form>
  );
}
