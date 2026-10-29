"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMe } from "@/features/account/useMe";
import { errorMessage } from "@/lib/api/errors";
import { clearPendingCartIntent, readPendingCartIntent } from "../intent";
import { useAddToCart } from "../hooks";

// Resumes the "add to cart" a guest started before being sent to /login.
export function PendingCartIntent() {
  const me = useMe();
  const router = useRouter();
  const add = useAddToCart();
  const processed = useRef(false);
  useEffect(() => {
    if (!me.data || processed.current) return;
    const intent = readPendingCartIntent();
    if (!intent) return;
    processed.current = true;
    clearPendingCartIntent();
    add.mutateAsync({ productId: intent.productId, quantity: intent.quantity }).then(
      () => {
        if (intent.goToCart) return router.push("/cart");
        toast.success("Đã thêm vào giỏ hàng", { action: { label: "Xem giỏ", onClick: () => router.push("/cart") } });
      },
      (e: unknown) => toast.error(errorMessage(e)),
    );
  }, [add, me.data, router]);
  return null;
}
