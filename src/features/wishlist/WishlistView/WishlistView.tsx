"use client";

import Link from "next/link";
import { useMe } from "@/features/account/useMe";
import { Alert } from "@/components/ui/Alert/Alert";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { errorMessage } from "@/lib/api/errors";
import { loginHref } from "@/lib/safe-next";
import { useWishlist } from "@/features/wishlist/hooks";
import { WishlistCard } from "../WishlistCard/WishlistCard";
import { WishlistEmptyState } from "../WishlistEmptyState/WishlistEmptyState";
import styles from "./WishlistView.module.scss";

export function WishlistView({ page }: { page: number }) {
  const me = useMe();
  const wishlist = useWishlist(me.data?.id, page);
  if (me.data === null)
    return <Alert tone="info" title="Bạn chưa đăng nhập"><Link href={loginHref("/wishlist")}>Đăng nhập</Link> để xem danh sách yêu thích.</Alert>;
  if (me.isPending || wishlist.isPending) return <Skeleton className={styles.loading} />;
  if (me.isError || wishlist.isError) return <Alert tone="error" title={errorMessage(me.error ?? wishlist.error)} />;
  if (!wishlist.data || wishlist.data.data.length === 0) return <WishlistEmptyState />;
  return <>
    <div className={styles.list}>{wishlist.data.data.map((item) => <WishlistCard key={item.id} userId={me.data!.id} item={item} flashSaleAlertEnabled={wishlist.data.meta.flashSaleAlertEnabled} />)}</div>
    <Pagination page={wishlist.data.meta.page} totalPages={wishlist.data.meta.totalPages} hrefFor={(next) => `/wishlist?page=${next}`} />
  </>;
}
