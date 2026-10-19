"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { TextField } from "@/components/ui/TextField/TextField";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { applyFieldErrors } from "@/lib/forms";
import { receiverSchema, type ReceiverInput } from "../schema";
import { usePlaceOrder } from "../usePlaceOrder";
import styles from "./CheckoutForm.module.scss";

type Problem = { message: string; backToCart: boolean } | null;

export function CheckoutForm({ defaults }: { defaults: ReceiverInput }) {
  const router = useRouter();
  const placeOrder = usePlaceOrder();
  // one key per checkout attempt, kept across retries so a timed-out request is never placed twice
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [problem, setProblem] = useState<Problem>(null);
  const { register, handleSubmit, setError, formState } = useForm<ReceiverInput>({
    resolver: zodResolver(receiverSchema),
    defaultValues: defaults,
  });

  const onSubmit = handleSubmit(async (receiver) => {
    setProblem(null);
    try {
      const body = await placeOrder.mutateAsync({ key: idempotencyKey, receiver });
      setIdempotencyKey(crypto.randomUUID());
      router.replace(`/account/orders/${body.data.id}?placed=1`);
    } catch (e) {
      if (isApiError(e, "CART_EMPTY")) router.replace("/cart");
      else if (isApiError(e, "OUT_OF_STOCK") || isApiError(e, "PRODUCT_UNAVAILABLE"))
        setProblem({ message: errorMessage(e), backToCart: true });
      else if (!applyFieldErrors(e, setError)) setProblem({ message: errorMessage(e), backToCart: false });
    }
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-labelledby="receiver-title">
      <h2 id="receiver-title" className={styles.title}>
        Thông tin nhận hàng
      </h2>
      {placeOrder.isPaused && (
        // TanStack Query pauses mutations while the browser is offline and resumes them with the same key
        <Alert tone="warning" title="Mất kết nối mạng. Đơn hàng sẽ được gửi khi có mạng trở lại." />
      )}
      {problem && (
        <Alert tone="error" title={problem.message}>
          {problem.backToCart && <Link href="/cart">Quay lại giỏ hàng</Link>}
        </Alert>
      )}
      <TextField label="Tên người nhận" autoComplete="name" required error={formState.errors.receiverName?.message} {...register("receiverName")} />
      <TextField
        label="Số điện thoại"
        type="tel"
        autoComplete="tel"
        required
        error={formState.errors.receiverPhone?.message}
        {...register("receiverPhone")}
      />
      <TextField
        label="Địa chỉ nhận hàng"
        autoComplete="street-address"
        required
        error={formState.errors.receiverAddress?.message}
        {...register("receiverAddress")}
      />
      <p className={styles.payment}>Phương thức thanh toán: Thanh toán khi nhận hàng (COD).</p>
      <Button type="submit" size="lg" fullWidth loading={placeOrder.isPending}>
        Xác nhận đặt hàng
      </Button>
    </form>
  );
}
