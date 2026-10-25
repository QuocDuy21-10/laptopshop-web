"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { TextField } from "@/components/ui/TextField/TextField";
import { api } from "@/lib/api/client";
import { errorMessage, isApiError, unwrap } from "@/lib/api/errors";
import { applyFieldErrors } from "@/lib/forms";
import { receiverSchema, type PaymentMethod, type ReceiverInput } from "../schema";
import { usePlaceOrder } from "../usePlaceOrder";
import styles from "./CheckoutForm.module.scss";

type Problem = { message: string; backToCart: boolean } | null;
type CheckoutFormProps = {
  defaults: Omit<ReceiverInput, "paymentMethod"> & Partial<Pick<ReceiverInput, "paymentMethod">>;
  availableMethods?: PaymentMethod[];
  couponCode?: string;
  pricingFingerprint: string;
  pricingReady: boolean;
  onPricingConflict: () => Promise<void>;
};

const IDEMPOTENCY_STORAGE_KEY = "laptopshop.checkout.idempotency-key";
const isPricingConflict = (error: unknown) =>
  isApiError(error, "PROMOTION_CHANGED") ||
  isApiError(error, "FLASH_SALE_QUOTA_EXCEEDED") ||
  isApiError(error, "FLASH_SALE_USER_LIMIT");

export function CheckoutForm({
  defaults,
  availableMethods = ["COD", "BANK_TRANSFER"],
  couponCode,
  pricingFingerprint,
  pricingReady,
  onPricingConflict,
}: CheckoutFormProps) {
  const router = useRouter();
  const placeOrder = usePlaceOrder();
  const [storedAttemptKey] = useState<string | null>(() =>
    typeof window !== "undefined" ? window.sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY) : null,
  );
  // one key per checkout attempt, kept across retries so a timed-out request is never placed twice
  const [idempotencyKey, setIdempotencyKey] = useState(() => {
    if (storedAttemptKey) return storedAttemptKey;
    if (typeof window !== "undefined") return window.sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY) ?? crypto.randomUUID();
    return crypto.randomUUID();
  });
  const [problem, setProblem] = useState<Problem>(null);
  const [isRecoveringAttempt, setIsRecoveringAttempt] = useState(Boolean(storedAttemptKey));
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveryAttempt, setRecoveryAttempt] = useState(0);
  const [isRepricing, setIsRepricing] = useState(false);
  const { register, handleSubmit, setError, formState } = useForm<ReceiverInput>({
    resolver: zodResolver(receiverSchema),
    defaultValues: { paymentMethod: "COD", ...defaults },
  });

  useEffect(() => {
    window.sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, idempotencyKey);
  }, [idempotencyKey]);

  useEffect(() => {
    const key = storedAttemptKey;
    if (!key) return;
    let active = true;
    void unwrap(api.GET("/api/v1/orders/checkout-attempt", { params: { header: { "Idempotency-Key": key } } }))
      .then(({ data }) => {
        if (!data?.id) {
          if (active) setRecoveryError("Không thể xác minh trạng thái đơn hàng trước đó. Vui lòng thử lại.");
          return;
        }
        window.sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
        router.replace(data.paymentMethod === "BANK_TRANSFER" ? `/account/orders/${data.id}/payment` : `/account/orders/${data.id}?placed=1`);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (isApiError(error, "CHECKOUT_ATTEMPT_NOT_FOUND")) {
          setIsRecoveringAttempt(false);
          return;
        }
        setRecoveryError("Không thể xác minh trạng thái đơn hàng trước đó. Vui lòng thử lại.");
      });
    return () => {
      active = false;
    };
  }, [recoveryAttempt, router, storedAttemptKey]);

  const onSubmit = handleSubmit(async (receiver) => {
    if (!pricingReady || !pricingFingerprint || isRecoveringAttempt || isRepricing) return;
    setProblem(null);
    try {
      const body = await placeOrder.mutateAsync({ key: idempotencyKey, receiver, couponCode, pricingFingerprint });
      window.sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
      const nextKey = crypto.randomUUID();
      window.sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, nextKey);
      setIdempotencyKey(nextKey);
      router.replace(body.data.paymentMethod === "BANK_TRANSFER" ? `/account/orders/${body.data.id}/payment` : `/account/orders/${body.data.id}?placed=1`);
    } catch (e) {
      if (isApiError(e, "CART_EMPTY")) router.replace("/cart");
      else if (isPricingConflict(e)) {
        window.sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
        const nextKey = crypto.randomUUID();
        window.sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, nextKey);
        setIdempotencyKey(nextKey);
        setIsRepricing(true);
        setProblem({ message: "Giá hoặc suất ưu đãi đã thay đổi. Vui lòng xác nhận lại đơn hàng.", backToCart: false });
        try {
          await onPricingConflict();
        } finally {
          setIsRepricing(false);
        }
      }
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
      {isRecoveringAttempt && recoveryError && (
        <Alert tone="error" title={recoveryError}>
          <Button variant="secondary" size="sm" onClick={() => {
            setRecoveryError(null);
            setRecoveryAttempt((attempt) => attempt + 1);
          }}>
            Thử lại
          </Button>
        </Alert>
      )}
      {!pricingReady && !isRecoveringAttempt && (
        <Alert tone="warning" title="Đang cập nhật giá và ưu đãi. Vui lòng chờ trước khi đặt hàng." />
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
      <fieldset className={styles.paymentMethods}>
        <legend className={styles.paymentLegend}>Phương thức thanh toán</legend>
        {availableMethods.includes("COD") && (
          <label className={styles.paymentOption}>
            <input type="radio" value="COD" {...register("paymentMethod")} />
            <span><strong>Thanh toán khi nhận hàng (COD)</strong><small>Thanh toán khi nhận laptop.</small></span>
          </label>
        )}
        {availableMethods.includes("BANK_TRANSFER") && (
          <label className={styles.paymentOption}>
            <input type="radio" value="BANK_TRANSFER" {...register("paymentMethod")} />
            <span><strong>Chuyển khoản bằng mã QR</strong><small>Quét mã bằng ứng dụng ngân hàng; hệ thống tự xác nhận giao dịch.</small></span>
          </label>
        )}
      </fieldset>
      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={placeOrder.isPending}
        disabled={!pricingReady || isRecoveringAttempt || isRepricing}
      >
        Xác nhận đặt hàng
      </Button>
    </form>
  );
}
