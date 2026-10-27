"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useWishlistSummary } from "@/features/wishlist/hooks";
import { useMe } from "@/features/account/useMe";
import styles from "./WishlistLink.module.scss";

export function WishlistLink({ userId }: { userId?: number }) {
  const me = useMe();
  const effectiveUserId = userId ?? me.data?.id;
  const query = useWishlistSummary(effectiveUserId);
  if (effectiveUserId === undefined) return null;
  const count = query.data?.itemCount ?? 0;
  return <Link href="/wishlist" className={styles.link} aria-label={`Wishlist${count ? ` (${count})` : ""}`}><Heart size={20} aria-hidden="true" />{count > 0 && <span className={styles.badge}>{count > 99 ? "99+" : count}</span>}</Link>;
}
