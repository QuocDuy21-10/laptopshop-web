"use client";

import { ShoppingCart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useMe } from "@/features/account/useMe";
import styles from "./CartLink.module.scss";

export function CartLink() {
  const { data: me } = useMe();
  const reduce = useReducedMotion();
  const count = me?.cartItemCount ?? 0;

  return (
    <Link href="/cart" className={styles.cart} aria-label={`Giỏ hàng, ${count} sản phẩm`}>
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
  );
}
