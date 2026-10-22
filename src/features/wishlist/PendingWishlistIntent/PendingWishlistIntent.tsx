"use client";

import { useEffect, useRef, useState } from "react";
import { useMe } from "@/features/account/useMe";
import { useAddWishlistItem } from "@/features/wishlist/hooks";
import { clearPendingWishlistIntent, readPendingWishlistIntent } from "@/features/wishlist/intent";
import { errorMessage, isApiError } from "@/lib/api/errors";

export function PendingWishlistIntent() {
  const me = useMe();
  const add = useAddWishlistItem(me.data?.id);
  const processed = useRef(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!me.data || processed.current) return;
    const intent = readPendingWishlistIntent();
    if (!intent) return;
    processed.current = true;
    void add.mutateAsync(intent.productId).then(
      () => clearPendingWishlistIntent(),
      (error: unknown) => {
        if (isApiError(error, "PRODUCT_UNAVAILABLE") || isApiError(error, "NOT_FOUND") || isApiError(error, "WISHLIST_ITEM_NOT_FOUND") || isApiError(error, "WISHLIST_LIMIT_REACHED") || isApiError(error, "INVALID_TARGET_PRICE")) clearPendingWishlistIntent();
        else setError(errorMessage(error));
      },
    );
  }, [add, me.data]);
  return error ? <p role="alert">{error}</p> : null;
}
