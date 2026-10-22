import type { FilterOptions, Product } from "@/lib/api/types";
import { optionName } from "../labels";
import { ProductCard } from "../ProductCard/ProductCard";
import styles from "./ProductGrid.module.scss";
import { WishlistStatusProvider } from "@/features/wishlist/WishlistStatusProvider/WishlistStatusProvider";

export function ProductGrid({ products, options }: { products: Product[]; options?: FilterOptions }) {
  return (
    <WishlistStatusProvider productIds={products.map((p) => p.id)}>
      <ul role="list" className={styles.grid}>
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} factoryName={options ? optionName(options.factoryOptions, p.factory) : undefined} />
          </li>
        ))}
      </ul>
    </WishlistStatusProvider>
  );
}
