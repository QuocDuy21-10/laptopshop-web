import Link from "next/link";
import { Badge } from "@/components/ui/Badge/Badge";
import { Price } from "@/components/ui/Price/Price";
import { CompareToggle } from "@/features/compare/CompareToggle/CompareToggle";
import type { CatalogProduct, Product } from "@/lib/api/types";
import { AddToCartButton } from "../AddToCart/AddToCartButton";
import { ProductImage } from "../ProductImage/ProductImage";
import styles from "./ProductCard.module.scss";

export function ProductCard({ product, factoryName }: { product: Product | CatalogProduct; factoryName?: string }) {
  const inStock = product.quantity > 0;
  const reviewSummary = "reviewSummary" in product ? product.reviewSummary : undefined;
  return (
    <article className={styles.card}>
      <ProductImage src={product.image} alt={product.name} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
      <p className={styles.maker}>{factoryName ?? product.factory}</p>
      <h3 className={styles.title}>
        <Link href={`/products/${product.id}`} className={styles.link}>
          {product.name}
        </Link>
      </h3>
      {product.shortDesc && <p className={styles.spec}>{product.shortDesc}</p>}
      {reviewSummary && (
        <p className={styles.rating} aria-label={reviewSummary.averageRating === null ? "Chưa có đánh giá" : `Đánh giá ${reviewSummary.averageRating} sao, ${reviewSummary.totalReviews} đánh giá`}>
          {reviewSummary.averageRating === null ? "Chưa có đánh giá" : `★ ${reviewSummary.averageRating} (${reviewSummary.totalReviews})`}
        </p>
      )}
      <Price value={product.price} />
      <div className={styles.footer}>
        <Badge tone={inStock ? "success" : "error"}>{inStock ? "Còn hàng" : "Hết hàng"}</Badge>
        <AddToCartButton productId={product.id} productName={product.name} disabled={!inStock} />
        <CompareToggle product={product} />
      </div>
    </article>
  );
}
