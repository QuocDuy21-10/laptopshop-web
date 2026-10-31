"use client";

import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useAuthPrompt } from "@/features/auth/AuthPrompt/AuthPromptProvider";
import { useMe } from "@/features/account/useMe";
import { useAddWishlistItem, useRemoveWishlistItem, useWishlistStatus } from "@/features/wishlist/hooks";
import { savePendingWishlistIntent } from "@/features/wishlist/intent";
import { useHydrated } from "@/lib/useHydrated";
import { useWishlistStatusContext } from "../WishlistStatusProvider/WishlistStatusProvider";
import styles from "./WishlistToggle.module.scss";

export function WishlistToggle({ productId, productName }: { productId: number; productName: string }) {
  const me = useMe();
  const promptLogin = useAuthPrompt();
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const context = useWishlistStatusContext();
  const fallback = useWishlistStatus(me.data?.id, context ? [] : [productId]);
  const status = context?.status.get(productId) ?? fallback.data?.find((item) => item.productId === productId)?.isWishlisted ?? false;
  // isLoading, not isPending: the status query is disabled for guests and would stay pending forever
  const isPending = me.isPending || context?.isPending || fallback.isLoading;
  // The server always renders the query as pending; React never patches a mismatched `disabled` during hydration,
  // so only reflect the loading state after hydration (the server snapshot is false).
  const hydrated = useHydrated();
  const add = useAddWishlistItem(me.data?.id);
  const remove = useRemoveWishlistItem(me.data?.id);
  const label = status ? `Bỏ ${productName} khỏi danh sách yêu thích` : `Thêm ${productName} vào danh sách yêu thích`;
  const onClick = () => {
    if (!me.data) {
      const returnTo = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`;
      savePendingWishlistIntent({ action: "ADD_WISHLIST", productId, returnTo });
      promptLogin({ reason: "wishlist", returnTo });
      return;
    }
    if (status) remove.mutate(productId);
    else add.mutate(productId);
  };
  return <button type="button" className={styles.touchTarget} aria-label={label} aria-pressed={status} disabled={hydrated && (isPending || add.isPending || remove.isPending)} onClick={onClick}><motion.span
      key={String(status)}
      className={styles.heart}
      initial={reduce || !status ? false : { scale: 0.6 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 12 }}
    ><Heart size={20} fill={status ? "currentColor" : "none"} aria-hidden="true" /></motion.span></button>;
}
