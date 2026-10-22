import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container/Container";
import { Badge } from "@/components/ui/Badge/Badge";
import { CompareToggle } from "@/features/compare/CompareToggle/CompareToggle";
import { SpecTable } from "@/features/compare/SpecTable/SpecTable";
import { AddToCart } from "@/features/products/AddToCart/AddToCart";
import { optionName } from "@/features/products/labels";
import { ProductImage } from "@/features/products/ProductImage/ProductImage";
import { ReviewSection } from "@/features/reviews/ReviewSection/ReviewSection";
import { PromotionPrice } from "@/features/promotions/PromotionPrice/PromotionPrice";
import { getFilterOptions, getProduct } from "@/features/products/server";
import { getInitialReviews } from "@/features/reviews/server";
import styles from "./page.module.scss";

type Props = { params: Promise<{ id: string }> };

const parseId = (raw: string) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id);
  if (!id) return {};
  const product = await getProduct(id);
  return { title: product.name, description: product.shortDesc ?? undefined };
}

export default async function ProductPage({ params }: Props) {
  const id = parseId((await params).id);
  if (!id) notFound();
  const [product, options, reviews] = await Promise.all([getProduct(id), getFilterOptions(), getInitialReviews(id)]);
  const inStock = product.quantity > 0;
  const paragraphs = (product.detailDesc ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <Container className={styles.page}>
      <nav aria-label="Đường dẫn" className={styles.breadcrumb}>
        <Link href="/products">Laptop</Link> / <span aria-current="page">{product.name}</span>
      </nav>
      <div className={styles.layout}>
        <ProductImage src={product.image} alt={product.name} sizes="(min-width: 1024px) 50vw, 100vw" priority />
        <div className={styles.info}>
          <p className={styles.maker}>{optionName(options.factoryOptions, product.factory)}</p>
          <h1 className={styles.title}>{product.name}</h1>
          {product.target && (
            <Link href={`/products?target=${product.target}`} className={styles.target}>
              {optionName(options.targetOptions, product.target)}
            </Link>
          )}
          {product.shortDesc && <p className={styles.highlight}>{product.shortDesc}</p>}
          <PromotionPrice product={product} size="lg" />
          <Badge tone={inStock ? "success" : "error"}>{inStock ? "Còn hàng" : "Hết hàng"}</Badge>
          <AddToCart productId={product.id} stock={product.quantity} />
          <CompareToggle product={product} />
          <p className={styles.note}>Thanh toán khi nhận hàng (COD).</p>
        </div>
      </div>
      <SpecTable product={product} />
      {paragraphs.length > 0 && (
        <section aria-labelledby="desc-title" className={styles.description}>
          <h2 id="desc-title" className={styles.sectionTitle}>
            Mô tả sản phẩm
          </h2>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      )}
      <ReviewSection productId={product.id} initialSummary={reviews.summary} initialPage={reviews.page} />
    </Container>
  );
}
