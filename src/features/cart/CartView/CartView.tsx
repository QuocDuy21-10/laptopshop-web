"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button, buttonClassName } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { errorMessage } from "@/lib/api/errors";
import { CartLine } from "../CartLine/CartLine";
import { CartSummary } from "../CartSummary/CartSummary";
import { useCart } from "../hooks";
import styles from "./CartView.module.scss";

export function CartView() {
  const cart = useCart();

  if (cart.isPending) return <Skeleton className={styles.skeleton} />;
  if (cart.isError) {
    return (
      <Alert tone="error" title="Không tải được giỏ hàng">
        <p>{errorMessage(cart.error)}</p>
        <Button variant="secondary" size="sm" onClick={() => cart.refetch()}>
          Thử lại
        </Button>
      </Alert>
    );
  }
  if (cart.data.items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart size={40} aria-hidden="true" />}
        title="Giỏ hàng đang trống"
        description="Chọn một chiếc laptop phù hợp và thêm vào giỏ."
        action={
          <Link href="/products" className={buttonClassName()}>
            Xem laptop
          </Link>
        }
      />
    );
  }

  const blocked = cart.data.items.some((i) => !i.product.isActive);

  return (
    <div className={styles.layout}>
      <ul role="list" className={styles.lines}>
        {cart.data.items.map((line) => (
          <CartLine key={line.id} line={line} />
        ))}
      </ul>
      <CartSummary
        cart={cart.data}
        action={
          blocked ? (
            <>
              <p className={styles.notice} role="status">
                Xoá sản phẩm ngừng kinh doanh khỏi giỏ để tiếp tục đặt hàng.
              </p>
              <Button size="lg" fullWidth disabled>
                Tiến hành đặt hàng
              </Button>
            </>
          ) : (
            <Link href="/checkout" className={buttonClassName({ size: "lg", fullWidth: true })}>
              Tiến hành đặt hàng
            </Link>
          )
        }
      />
    </div>
  );
}
