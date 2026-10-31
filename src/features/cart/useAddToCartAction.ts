"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { loginHref } from "@/lib/safe-next";
import { useAddToCart } from "./hooks";
import { savePendingCartIntent } from "./intent";

export function useAddToCartAction() {
  const addToCart = useAddToCart();
  const router = useRouter();

  const add = async (productId: number, quantity: number, opts: { goToCart?: boolean } = {}) => {
    try {
      await addToCart.mutateAsync({ productId, quantity });
      if (opts.goToCart) {
        router.push("/cart");
        return;
      }
      toast.success("Đã thêm vào giỏ hàng", {
        action: { label: "Xem giỏ", onClick: () => router.push("/cart") },
      });
    } catch (e) {
      // the API has no guest cart: remember the action, log in, then PendingCartIntent replays it
      if (isApiError(e) && e.status === 401) {
        savePendingCartIntent({ productId, quantity, goToCart: Boolean(opts.goToCart) });
        // keep the query so pages like /compare?ids=… come back intact
        const { pathname, search } = window.location;
        router.push(loginHref(pathname + search));
      } else toast.error(errorMessage(e));
    }
  };

  return { add, isPending: addToCart.isPending };
}
