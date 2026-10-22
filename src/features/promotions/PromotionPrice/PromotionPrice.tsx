import { Price } from "@/components/ui/Price/Price";
import type { Product, PricedProduct } from "@/lib/api/types";
import styles from "./PromotionPrice.module.scss";

export function PromotionPrice({ product, size = "md" }: { product: Product | PricedProduct; size?: "sm" | "md" | "lg" }) {
  const salePrice = "salePrice" in product && product.salePrice !== undefined ? product.salePrice : product.price;
  const discounted = salePrice < product.price;
  return (
    <span className={styles.wrap} data-size={size}>
      {discounted && <span className={styles.listPrice}><Price value={product.price} size="sm" /></span>}
      <Price value={salePrice} size={size === "sm" ? "sm" : "lg"} />
      {discounted && <span className={styles.badge}>-{Math.round((1 - salePrice / product.price) * 100)}%</span>}
    </span>
  );
}
