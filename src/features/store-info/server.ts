import "server-only";
import { catalogServerApi } from "@/lib/api/server";
import type { StoreInfo } from "@/lib/api/types";

// The footer must never block a page: without store details it simply shows less.
export async function getStoreInfo(): Promise<StoreInfo | null> {
  try {
    const { data, response } = await catalogServerApi.GET("/api/v1/store-info");
    return response.ok && data ? data.data : null;
  } catch {
    return null;
  }
}
