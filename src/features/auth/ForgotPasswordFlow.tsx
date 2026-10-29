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
import { useForgotPassword, useResetPassword } from "./hooks";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "./schemas";
import styles from "./AuthForm.module.scss";

// The email stays in component state (not the URL) between the two steps.
export function ForgotPasswordFlow() {
  const [email, setEmail] = useState<string | null>(null);
  return email === null ? <RequestStep onSent={setEmail} /> : <ResetStep email={email} onBack={() => setEmail(null)} />;
}

function RequestStep({ onSent }: { onSent: (email: string) => void }) {
  const forgot = useForgotPassword();
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { username: "" },
  });
  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await forgot.mutateAsync(values);
      onSent(values.username);
    } catch (e) {
      if (!applyFieldErrors(e, setError)) setFormError(errorMessage(e));
    }
  });
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <p className={styles.hint}>Nhập email đã đăng ký, chúng tôi sẽ gửi mã gồm 6 chữ số để đặt lại mật khẩu.</p>
      {formError && <Alert tone="error" title={formError} />}
      <TextField label="Email" type="email" autoComplete="email" required error={formState.errors.username?.message} {...register("username")} />
      <Button type="submit" size="lg" fullWidth loading={forgot.isPending}>
        Gửi mã
      </Button>
    </form>
  );
}

function ResetStep({ email, onBack }: { email: string; onBack: () => void }) {
  const router = useRouter();
  const reset = useResetPassword();
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: "", password: "", confirmPassword: "" },
  });
  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await reset.mutateAsync({ username: email, ...values });
      router.replace("/login?reset=1");
    } catch (e) {
      if (isApiError(e, "PASSWORD_RESET_CODE_INVALID")) setError("code", { message: errorMessage(e) });
      else if (!applyFieldErrors(e, setError)) setFormError(errorMessage(e));
    }
  });
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Alert tone="info" title="Nếu email này đã đăng ký, mã đã được gửi tới hộp thư của bạn.">
        Mã có hiệu lực 15 phút.
      </Alert>
      {formError && <Alert tone="error" title={formError} />}
      <TextField label="Mã xác nhận" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required error={formState.errors.code?.message} {...register("code")} />
      <TextField label="Mật khẩu mới" type="password" revealable autoComplete="new-password" hint="Tối thiểu 8 ký tự" required error={formState.errors.password?.message} {...register("password")} />
      <TextField label="Nhập lại mật khẩu mới" type="password" revealable autoComplete="new-password" required error={formState.errors.confirmPassword?.message} {...register("confirmPassword")} />
      <Button type="submit" size="lg" fullWidth loading={reset.isPending}>
        Đặt lại mật khẩu
      </Button>
      <Button type="button" variant="ghost" fullWidth onClick={onBack}>
        Dùng email khác hoặc gửi lại mã
      </Button>
    </form>
  );
}
