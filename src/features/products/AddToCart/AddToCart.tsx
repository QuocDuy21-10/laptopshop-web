"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper/QuantityStepper";
import { useAddToCartAction } from "@/features/cart/useAddToCartAction";
import styles from "./AddToCart.module.scss";

export function AddToCart({ productId, stock }: { productId: number; stock: number }) {
  const [quantity, setQuantity] = useState(1);
  const [buyNow, setBuyNow] = useState(false);
  const { add, isPending } = useAddToCartAction();

  if (stock <= 0) return <p className={styles.soldOut}>Sản phẩm tạm hết hàng.</p>;

  const submit = async (goToCart: boolean) => {
    setBuyNow(goToCart);
    await add(productId, quantity, { goToCart });
  };

  return (
    <div className={styles.actions}>
      <QuantityStepper value={quantity} max={Math.min(stock, 100)} onChange={setQuantity} />
      <Button variant="secondary" size="lg" loading={isPending && !buyNow} disabled={isPending} onClick={() => submit(false)}>
        Thêm vào giỏ
      </Button>
      <Button size="lg" loading={isPending && buyNow} disabled={isPending} onClick={() => submit(true)}>
        Mua ngay
      </Button>
    </div>
  );
}
