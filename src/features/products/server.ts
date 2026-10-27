import "server-only";
import { catalogServerApi, fetchPublic, freshServerApi } from "@/lib/api/server";
import type { CatalogProduct, FilterOptions, PageMeta, ProductFacets, ProductFacetsQuery, ProductQuery } from "@/lib/api/types";

export async function getFilterOptions(): Promise<FilterOptions> {
  return (await fetchPublic(catalogServerApi.GET("/api/v1/products/filters"))).data;
}

export async function listProducts(query: ProductQuery): Promise<{ data: CatalogProduct[]; meta: PageMeta }> {
  return fetchPublic(freshServerApi.GET("/api/v1/products", { params: { query } }));
}

export async function getProductFacets(query: ProductFacetsQuery): Promise<ProductFacets> {
  return (await fetchPublic(freshServerApi.GET("/api/v1/products/facets", { params: { query } }))).data;
}

export async function getProduct(id: number): Promise<CatalogProduct> {
  return (await fetchPublic(freshServerApi.GET("/api/v1/products/{id}", { params: { path: { id } } }))).data;
}
