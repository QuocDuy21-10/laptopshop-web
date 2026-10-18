"use client";

import { Button } from "@/components/ui/Button/Button";
import { useAddToCartAction } from "@/features/cart/useAddToCartAction";

export function AddToCartButton({ productId, productName, disabled }: { productId: number; productName: string; disabled: boolean }) {
  const { add, isPending } = useAddToCartAction();
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={disabled}
      loading={isPending}
      aria-label={`Thêm ${productName} vào giỏ`}
      onClick={() => add(productId, 1)}
    >
      {disabled ? "Hết hàng" : "Thêm vào giỏ"}
    </Button>
  );
}
