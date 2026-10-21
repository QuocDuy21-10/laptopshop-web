import type { CatalogProduct, FilterOptions } from "@/lib/api/types";
import { optionName } from "../labels";
import { ProductCard } from "../ProductCard/ProductCard";
import styles from "./ProductGrid.module.scss";

export function ProductGrid({ products, options }: { products: CatalogProduct[]; options?: FilterOptions }) {
  return (
    <ul role="list" className={styles.grid}>
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} factoryName={options ? optionName(options.factoryOptions, p.factory) : undefined} />
        </li>
      ))}
    </ul>
  );
}
