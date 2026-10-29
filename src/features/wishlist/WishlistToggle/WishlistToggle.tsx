"use client";

import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useMe } from "@/features/account/useMe";
import { useAddWishlistItem, useRemoveWishlistItem, useWishlistStatus } from "@/features/wishlist/hooks";
import { savePendingWishlistIntent } from "@/features/wishlist/intent";
import { loginHref } from "@/lib/safe-next";
import { useWishlistStatusContext } from "../WishlistStatusProvider/WishlistStatusProvider";
import styles from "./WishlistToggle.module.scss";

const noopSubscribe = () => () => {};

export function WishlistToggle({ productId, productName }: { productId: number; productName: string }) {
  const me = useMe();
  const router = useRouter();
  const pathname = usePathname();
  const context = useWishlistStatusContext();
  const fallback = useWishlistStatus(me.data?.id, context ? [] : [productId]);
  const status = context?.status.get(productId) ?? fallback.data?.find((item) => item.productId === productId)?.isWishlisted ?? false;
  // isLoading, not isPending: the status query is disabled for guests and would stay pending forever
  const isPending = me.isPending || context?.isPending || fallback.isLoading;
  // The server always renders the query as pending; React never patches a mismatched `disabled` during hydration,
  // so only reflect the loading state after hydration (the server snapshot is false).
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const add = useAddWishlistItem(me.data?.id);
  const remove = useRemoveWishlistItem(me.data?.id);
  const label = status ? `Bỏ ${productName} khỏi Wishlist` : `Thêm ${productName} vào Wishlist`;
  const onClick = () => {
    if (!me.data) {
      const returnTo = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`;
      savePendingWishlistIntent({ action: "ADD_WISHLIST", productId, returnTo });
      router.push(loginHref(returnTo));
      return;
    }
    if (status) remove.mutate(productId);
    else add.mutate(productId);
  };
  return <button type="button" className={styles.touchTarget} aria-label={label} aria-pressed={status} disabled={hydrated && (isPending || add.isPending || remove.isPending)} onClick={onClick}><Heart size={20} fill={status ? "currentColor" : "none"} aria-hidden="true" /></button>;
}
