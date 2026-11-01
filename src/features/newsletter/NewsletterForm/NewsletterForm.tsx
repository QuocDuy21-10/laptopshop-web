"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { TextField } from "@/components/ui/TextField/TextField";
import { errorMessage } from "@/lib/api/errors";
import { applyFieldErrors } from "@/lib/forms";
import { useSubscribeNewsletter } from "../hooks";
import { newsletterSubscribeSchema, type NewsletterSubscribeInput } from "../schemas";
import styles from "./NewsletterForm.module.scss";

// After a successful call the form always shows the same neutral notice, so it never reveals whether an email is already subscribed.
export function NewsletterForm() {
  const subscribe = useSubscribeNewsletter();
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<NewsletterSubscribeInput>({
    resolver: zodResolver(newsletterSubscribeSchema),
    defaultValues: { email: "" },
  });
  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await subscribe.mutateAsync(values);
      setSent(true);
    } catch (e) {
      if (!applyFieldErrors(e, setError)) setFormError(errorMessage(e));
    }
  });

  if (sent) {
    return (
      <Alert tone="info" title="Nếu email hợp lệ, bạn sẽ nhận được thư xác nhận trong ít phút.">
        Hãy mở thư và bấm &quot;Xác nhận đăng ký&quot; để hoàn tất. Nếu không thấy, kiểm tra cả hộp thư rác.
      </Alert>
    );
  }
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {formError && <Alert tone="error" title={formError} />}
      <TextField
        label="Email nhận ưu đãi"
        type="email"
        autoComplete="email"
        required
        error={formState.errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" loading={subscribe.isPending}>
        Đăng ký
      </Button>
    </form>
  );
}
