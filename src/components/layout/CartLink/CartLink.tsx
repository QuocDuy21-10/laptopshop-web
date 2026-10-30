"use client";

import * as Popover from "@radix-ui/react-popover";
import { ShoppingCart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { MiniCart } from "@/components/layout/MiniCart/MiniCart";
import { useMe } from "@/features/account/useMe";
import styles from "./CartLink.module.scss";

// below this width the link goes straight to /cart; a popover is cramped on phones
const hasPopover = () => window.matchMedia("(min-width: 768px)").matches;

export function CartLink() {
  const [open, setOpen] = useState(false);
  const { data: me } = useMe();
  const reduce = useReducedMotion();
  const count = me?.cartItemCount ?? 0;

  // anonymous visitors are sent to the login page by /cart, so there is nothing to preview
  const canPreview = () => me !== undefined && hasPopover();

  return (
    <Popover.Root open={open} onOpenChange={(next) => setOpen(next && canPreview())}>
      <Popover.Trigger asChild>
        <Link
          href="/cart"
          className={styles.cart}
          aria-label={`Giỏ hàng, ${count} sản phẩm`}
          onClick={(e) => {
            // preventDefault also stops Popover.Trigger's own toggle, so toggle here
            if (canPreview()) {
              e.preventDefault();
              setOpen((o) => !o);
            }
          }}
        >
          <ShoppingCart size={20} aria-hidden="true" />
          <span className={styles.label}>Giỏ hàng</span>
          {count > 0 && (
            <motion.span
              key={count}
              className={styles.badge}
              initial={reduce ? false : { scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-hidden="true"
            >
              {count}
            </motion.span>
          )}
        </Link>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={8} className={styles.popover} aria-label="Giỏ hàng">
          <MiniCart onNavigate={() => setOpen(false)} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
