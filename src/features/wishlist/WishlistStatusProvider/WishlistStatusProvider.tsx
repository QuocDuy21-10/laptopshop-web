"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useMe } from "@/features/account/useMe";
import { useWishlistStatus } from "@/features/wishlist/hooks";

type WishlistStatusContextValue = { status: Map<number, boolean>; isPending: boolean };
const WishlistStatusContext = createContext<WishlistStatusContextValue | null>(null);

export function WishlistStatusProvider({ productIds, children }: { productIds: number[]; children: ReactNode }) {
  const me = useMe();
  const query = useWishlistStatus(me.data?.id, productIds);
  const status = new Map((query.data ?? []).map((item) => [item.productId, item.isWishlisted]));
  return <WishlistStatusContext.Provider value={{ status, isPending: me.isPending || query.isPending }}>{children}</WishlistStatusContext.Provider>;
}

export const useWishlistStatusContext = () => useContext(WishlistStatusContext);
