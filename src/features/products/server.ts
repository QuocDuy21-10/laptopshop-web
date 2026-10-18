import "server-only";
import { fetchPublic, serverApi } from "@/lib/api/server";
import type { FilterOptions } from "@/lib/api/types";

export async function getFilterOptions(): Promise<FilterOptions> {
  return (await fetchPublic(serverApi.GET("/api/v1/products/filters"))).data;
}
