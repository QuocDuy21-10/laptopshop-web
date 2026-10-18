"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { Price } from "@/components/ui/Price/Price";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { useMe } from "@/features/account/useMe";
import { CartSummary } from "@/features/cart/CartSummary/CartSummary";
import { useCart } from "@/features/cart/hooks";
import { errorMessage } from "@/lib/api/errors";
import { CheckoutForm } from "../CheckoutForm/CheckoutForm";
import styles from "./CheckoutView.module.scss";

export function CheckoutView() {
  const router = useRouter();
  const me = useMe();
  const cart = useCart();
  const empty = cart.data?.items.length === 0;

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
        }}
      />
      <CartSummary
        cart={cart.data}
        title="Đơn hàng của bạn"
        action={
          <ul role="list" className={styles.items}>
            {cart.data.items.map((line) => (
              <li key={line.id} className={styles.item}>
                <span>
                  {line.product.name} × {line.quantity}
                </span>
                <Price value={line.lineTotal} size="sm" />
              </li>
            ))}
          </ul>
        }
      />
    </div>
  );
}
