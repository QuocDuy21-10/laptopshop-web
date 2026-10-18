import "server-only";
import { fetchPublic, serverApi } from "@/lib/api/server";
import type { FilterOptions, PageMeta, Product, ProductQuery } from "@/lib/api/types";

export async function getFilterOptions(): Promise<FilterOptions> {
  return (await fetchPublic(serverApi.GET("/api/v1/products/filters"))).data;
}

export async function listProducts(query: ProductQuery): Promise<{ data: Product[]; meta: PageMeta }> {
  return fetchPublic(serverApi.GET("/api/v1/products", { params: { query } }));
}

export async function getProduct(id: number): Promise<Product> {
  return (await fetchPublic(serverApi.GET("/api/v1/products/{id}", { params: { path: { id } } }))).data;
}
