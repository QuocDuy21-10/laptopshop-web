"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { Price } from "@/components/ui/Price/Price";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { useMe } from "@/features/account/useMe";
import { CartSummary } from "@/features/cart/CartSummary/CartSummary";
import { useCart } from "@/features/cart/hooks";
import { usePaymentMethods } from "@/features/payments/hooks";
import { errorMessage } from "@/lib/api/errors";
import { CheckoutForm } from "../CheckoutForm/CheckoutForm";
import { useCheckoutQuote } from "../useCheckoutQuote";
import styles from "./CheckoutView.module.scss";

type QuoteLinePricing = { productId: number; netLineTotal: number };

const quoteLinePricing = (line: unknown): QuoteLinePricing | null => {
  if (!line || typeof line !== "object") return null;
  const { productId, netLineTotal } = line as Record<string, unknown>;
  return typeof productId === "number" && typeof netLineTotal === "number" ? { productId, netLineTotal } : null;
};

export function CheckoutView() {
  const router = useRouter();
  const me = useMe();
  const cart = useCart();
  const paymentMethods = usePaymentMethods();
  const quote = useCheckoutQuote();
  const empty = cart.data?.items.length === 0;
  const quoteData = quote.data;
  const quoteTotals = new Map(
    (quoteData?.lines ?? []).flatMap((line) => {
      const pricing = quoteLinePricing(line);
      return pricing ? [[pricing.productId, pricing.netLineTotal] as const] : [];
    }),
  );
  const hasPricingForCart =
    Boolean(quoteData?.pricingFingerprint) && (cart.data?.items.every((line) => quoteTotals.has(line.product.id)) ?? false);
  const validQuote = hasPricingForCart && !quote.isPending && !quote.isFetching && !quote.isError && quoteData ? quoteData : null;
  const pricingReady = Boolean(validQuote);

  useEffect(() => {
    if (empty) router.replace("/cart");
  }, [empty, router]);

  if (cart.isError || me.isError) {
    return <Alert tone="error" title={errorMessage(cart.error ?? me.error)} />;
  }
  if (cart.isPending || me.isPending || empty || !cart.data) return <Skeleton className={styles.skeleton} />;

  return (
    <div className={styles.layout}>
      <CheckoutForm
        defaults={{
          receiverName: me.data?.fullName ?? "",
          receiverPhone: me.data?.phone ?? "",
          receiverAddress: me.data?.address ?? "",
          paymentMethod: "COD",
        }}
        availableMethods={(paymentMethods.data ?? [{ code: "COD", enabled: true }]).filter((method) => method.enabled).map((method) => method.code)}
        pricingFingerprint={quote.data?.pricingFingerprint ?? ""}
        pricingReady={pricingReady}
        onPricingConflict={async () => {
          await quote.refetch();
        }}
      />
      {validQuote ? (
        <CartSummary
          cart={cart.data}
          title="Đơn hàng của bạn"
          pricing={{
            productDiscount: validQuote.productDiscount,
            couponDiscount: validQuote.couponDiscount,
            total: validQuote.total,
          }}
          action={
            <ul role="list" className={styles.items}>
              {cart.data.items.map((line) => (
                <li key={line.id} className={styles.item}>
                  <span>
                    {line.product.name} × {line.quantity}
                  </span>
                  <Price value={quoteTotals.get(line.product.id)!} size="sm" />
                </li>
              ))}
            </ul>
          }
        />
      ) : (
        <Alert
          tone="warning"
          title={quote.isError ? "Không thể cập nhật giá và ưu đãi. Vui lòng thử lại trước khi đặt hàng." : "Đang xác nhận giá và ưu đãi."}
        />
      )}
    </div>
  );
}
