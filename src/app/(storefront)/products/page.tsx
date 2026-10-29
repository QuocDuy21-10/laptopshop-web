import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container/Container";
import { buttonClassName } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { ActiveFilterChips } from "@/features/products/ActiveFilterChips/ActiveFilterChips";
import { FilterSheet } from "@/features/products/FilterSheet/FilterSheet";
import { DesktopFilters } from "@/features/products/DesktopFilters/DesktopFilters";
import { ProductGrid } from "@/features/products/ProductGrid/ProductGrid";
import { parseFilters, toApiQuery, toFacetsApiQuery, toQueryString } from "@/features/products/search-params";
import { getFilterOptions, getProductFacets, listProducts } from "@/features/products/server";
import { brandForQuery } from "@/features/products/brandSearch";
import { Alert } from "@/components/ui/Alert/Alert";
import { productsMetadata } from "@/features/products/metadata";
import { SortSelect } from "@/features/products/SortSelect/SortSelect";
import styles from "./page.module.scss";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const raw = await searchParams;
  const metadata = productsMetadata(raw);
  const q = raw.q;
  return { ...metadata, title: typeof q === "string" && q.trim() ? `Tìm “${q.trim()}”` : "Laptop" };
}

export default async function ProductsPage({ searchParams }: Props) {
  const [raw, options] = await Promise.all([searchParams, getFilterOptions()]);
  const filters = parseFilters(raw, options);
  const [result, facets] = await Promise.all([
    listProducts(toApiQuery(filters)),
    getProductFacets(toFacetsApiQuery(filters)).catch(() => null),
  ]);

  const brand = filters.factory.length ? undefined : brandForQuery(filters.q, options.factoryOptions);

  return (
    <Container className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>{filters.q ? `Kết quả cho “${filters.q}”` : "Tất cả laptop"}</h1>
        <p className={styles.count}>{result.meta.total} sản phẩm</p>
      </div>
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Bộ lọc">
          <DesktopFilters definitions={options.facetDefinitions ?? []} counts={facets?.groups ?? {}} filters={filters} countsAvailable={facets !== null} />
        </aside>
        <div className={styles.results}>
          <div className={styles.toolbar}>
            <FilterSheet options={options} filters={filters} facets={facets} />
            <SortSelect filters={filters} />
          </div>
          <ActiveFilterChips options={options} filters={filters} />
          {brand && (
            <Alert tone="info" title={`Tìm theo tên chỉ khớp một phần máy ${brand.name}.`}>
              <Link href={`/products${toQueryString({ ...filters, q: undefined, factory: [brand.value], page: 1 })}`}>
                Xem tất cả laptop {brand.name}
              </Link>
            </Alert>
          )}
          <h2 className={styles.srOnly}>Danh sách laptop</h2>
          {result.data.length === 0 ? (
            <EmptyState
              icon={<SearchX size={40} aria-hidden="true" />}
              title="Không tìm thấy laptop phù hợp"
              description="Thử bỏ bớt bộ lọc hoặc tìm với từ khoá khác."
              action={
                <Link href="/products" className={buttonClassName({ variant: "secondary" })}>
                  Xoá bộ lọc
                </Link>
              }
            />
          ) : (
            <ProductGrid products={result.data} options={options} />
          )}
          <Pagination
            page={filters.page}
            totalPages={result.meta.totalPages}
            hrefFor={(page) => `/products${toQueryString({ ...filters, page })}`}
          />
        </div>
      </div>
    </Container>
  );
}
