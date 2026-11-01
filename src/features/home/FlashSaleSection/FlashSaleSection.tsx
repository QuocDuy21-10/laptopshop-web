import { Zap } from "lucide-react";
import Link from "next/link";
import { optionName } from "@/features/products/labels";
import { ProductCard } from "@/features/products/ProductCard/ProductCard";
import { WishlistStatusProvider } from "@/features/wishlist/WishlistStatusProvider/WishlistStatusProvider";
import type { CatalogProduct, FilterOptions } from "@/lib/api/types";
import { ScrollRow } from "../ScrollRow/ScrollRow";
import { FlashSaleTimer } from "./FlashSaleTimer";
import styles from "./FlashSaleSection.module.scss";

type Props = { products: CatalogProduct[]; renderedAt: string; options: FilterOptions | null };

export function FlashSaleSection({ products, renderedAt, options }: Props) {
  if (products.length === 0) return null;
  const endsAt = products
    .flatMap((p) => (p.promotion?.kind === "FLASH_SALE" ? [p.promotion.endsAt] : []))
    .sort((a, b) => Date.parse(a) - Date.parse(b))[0];
  return (
    <section aria-labelledby="flash-sale-heading" className={styles.section}>
      <div className={styles.header}>
        <h2 id="flash-sale-heading" className={styles.title}>
          <Zap size={22} aria-hidden="true" /> Flash Sale
        </h2>
        {endsAt && (
          <div className={styles.timer}>
            <span>Kết thúc sau</span>
            <span className={styles.timerValue}>
              <FlashSaleTimer endsAt={endsAt} renderedAt={renderedAt} />
            </span>
          </div>
        )}
        <Link href="/products?flashSale=true" className={styles.link}>
          Xem tất cả <span aria-hidden="true">→</span>
        </Link>
      </div>
      <WishlistStatusProvider productIds={products.map((p) => p.id)}>
        <ScrollRow label="Sản phẩm Flash Sale" className={styles.row}>
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} factoryName={options ? optionName(options.factoryOptions, p.factory) : undefined} />
            </li>
          ))}
        </ScrollRow>
      </WishlistStatusProvider>
    </section>
  );
}
