"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRef, useState, type KeyboardEvent } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { ProductGrid } from "@/features/products/ProductGrid/ProductGrid";
import { api } from "@/lib/api/client";
import { errorMessage, unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { CatalogProduct, FilterOptions } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { bestsellersHref, HOME_PRODUCT_LIMIT } from "../constants";
import { HomeSection } from "../HomeSection/HomeSection";
import styles from "./BestsellerTabs.module.scss";

type Tab = { value: string; name: string };
type Props = {
  tabs: Tab[];
  initialProducts: CatalogProduct[] | null;
  options: FilterOptions | null;
  renderedAt: string;
};

export function BestsellerTabs({ tabs, initialProducts, options, renderedAt }: Props) {
  const all: Tab[] = [{ value: "", name: "Tất cả" }, ...tabs];
  const [active, setActive] = useState("");
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const query = useQuery({
    // A server refresh replaces expired prices in every tab, including previously cached targets.
    queryKey: queryKeys.homeBestsellers(active, renderedAt),
    queryFn: async () =>
      (
        await unwrap(
          api.GET("/api/v1/products", {
            params: {
              query: {
                sort: "sold_desc",
                pageSize: HOME_PRODUCT_LIMIT,
                ...(active ? { target: active } : {}),
              },
            },
          }),
        )
      ).data,
    initialData: active === "" && initialProducts ? initialProducts : undefined,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const select = (index: number) => {
    const next = (index + all.length) % all.length;
    setActive(all[next].value);
    buttons.current[next]?.focus();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = all.findIndex((t) => t.value === active);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      select(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      select(index - 1);
    }
  };

  const products = query.data;
  return (
    <HomeSection
      id="bestsellers"
      title="Laptop bán chạy nhất"
      subtitle="Sắp xếp theo số lượng đã bán"
      link={{ href: bestsellersHref(active), label: "Xem thêm" }}
    >
      <div
        role="tablist"
        aria-label="Lọc theo nhu cầu"
        className={styles.tabs}
        onKeyDown={onKeyDown}
      >
        {all.map((tab, i) => (
          <button
            key={tab.value || "all"}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            id={`bestsellers-tab-${tab.value || "all"}`}
            type="button"
            role="tab"
            aria-selected={tab.value === active}
            aria-controls="bestsellers-panel"
            tabIndex={tab.value === active ? 0 : -1}
            className={cx(styles.tab, tab.value === active && styles.tabActive)}
            onClick={() => setActive(tab.value)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div
        id="bestsellers-panel"
        role="tabpanel"
        aria-labelledby={`bestsellers-tab-${active || "all"}`}
        aria-busy={query.isFetching || undefined}
        className={cx(query.isPlaceholderData && styles.stale)}
      >
        {query.isError && !products ? (
          <Alert tone="error" title="Không tải được sản phẩm">
            {errorMessage(query.error)}
          </Alert>
        ) : products && products.length === 0 ? (
          <EmptyState title="Chưa có sản phẩm hiển thị" as="p" />
        ) : products ? (
          <ProductGrid products={products} options={options ?? undefined} />
        ) : null}
      </div>
    </HomeSection>
  );
}
