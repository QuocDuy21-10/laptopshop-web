"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { TextField } from "@/components/ui/TextField/TextField";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { applyFieldErrors } from "@/lib/forms";
import { useRegister } from "./hooks";
import { registerSchema, type RegisterInput } from "./schemas";
import styles from "./AuthForm.module.scss";

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const registerUser = useRegister();
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", username: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerUser.mutateAsync(values);
      router.replace(next);
      router.refresh();
    } catch (e) {
      if (isApiError(e, "EMAIL_TAKEN")) setError("username", { message: errorMessage(e) });
      else if (!applyFieldErrors(e, setError)) setFormError(errorMessage(e));
    }
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {formError && <Alert tone="error" title={formError} />}
      <TextField label="Họ tên" autoComplete="name" required error={formState.errors.fullName?.message} {...register("fullName")} />
      <TextField label="Email" type="email" autoComplete="email" required error={formState.errors.username?.message} {...register("username")} />
      <TextField
        label="Mật khẩu"
        type="password"
        autoComplete="new-password"
        hint="Tối thiểu 8 ký tự"
        required
        error={formState.errors.password?.message}
        {...register("password")}
      />
      <TextField
        label="Nhập lại mật khẩu"
        type="password"
        autoComplete="new-password"
        required
        error={formState.errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button type="submit" size="lg" fullWidth loading={registerUser.isPending}>
        Tạo tài khoản
      </Button>
    </form>
  );
}
