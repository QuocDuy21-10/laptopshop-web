"use client";

import { useEffect, useRef } from "react";
import { useMe } from "@/features/account/useMe";
import { useAddWishlistItem } from "@/features/wishlist/hooks";
import { clearPendingWishlistIntent, readPendingWishlistIntent } from "@/features/wishlist/intent";
import { isApiError } from "@/lib/api/errors";

export function PendingWishlistIntent() {
  const me = useMe();
  const add = useAddWishlistItem(me.data?.id);
  const processed = useRef(false);
  useEffect(() => {
    if (!me.data || processed.current) return;
    const intent = readPendingWishlistIntent();
    if (!intent) return;
    processed.current = true;
    void add.mutateAsync(intent.productId).then(
      () => clearPendingWishlistIntent(),
      (error: unknown) => {
        if (isApiError(error, "PRODUCT_UNAVAILABLE") || isApiError(error, "NOT_FOUND")) clearPendingWishlistIntent();
      },
    );
  }, [add, me.data]);
  return null;
}
