"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { TextField } from "@/components/ui/TextField/TextField";
import { errorMessage, isApiError } from "@/lib/api/errors";
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
  const reduceMotion = useReducedMotion();
  const { register, handleSubmit, setError, setValue, setFocus, formState } = useForm<LoginInput>({
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
      if (applyFieldErrors(e, setError)) return;
      setFormError(errorMessage(e));
      if (isApiError(e, "INVALID_CREDENTIALS")) {
        setValue("password", "");
        setFocus("password");
      }
    }
  });

  // a stale credentials error contradicts what the user is now retyping
  const field = (name: "username" | "password") => {
    const r = register(name);
    return {
      ...r,
      onChange: (ev: Parameters<typeof r.onChange>[0]) => {
        setFormError(null);
        return r.onChange(ev);
      },
    };
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {passwordReset && <Alert tone="success" title="Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới." />}
      {hasCartIntent && <Alert tone="info" title="Đăng nhập để thêm sản phẩm vào giỏ hàng." />}
      <div className={styles.errorSlot}>
        <AnimatePresence initial={false}>
          {formError && (
            <motion.div
              key="form-error"
              className={styles.errorMotion}
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
            >
              <div className={styles.errorGap}>
                <Alert tone="error" title={formError} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <TextField
        label="Email"
        type="email"
        placeholder="name@example.com"
        autoComplete="email"
        required
        error={formState.errors.username?.message}
        invalid={!!formError}
        {...field("username")}
      />
      <TextField
        label="Mật khẩu"
        type="password"
        revealable
        autoComplete="current-password"
        required
        error={formState.errors.password?.message}
        invalid={!!formError}
        {...field("password")}
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
