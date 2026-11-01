import "server-only";
import { getFilterOptions } from "@/features/products/server";
import { getStoreInfo } from "@/features/store-info/server";
import { freshServerApi, homeServerApi } from "@/lib/api/server";
import type { CatalogProduct, FilterOptions, PublicHomeBanner, ReviewHighlights, StoreInfo } from "@/lib/api/types";
import { HOME_PRODUCT_LIMIT, REVIEW_LIMIT } from "./constants";

export type HomeData = {
  banners: { hero: PublicHomeBanner[]; side: PublicHomeBanner[] };
  options: FilterOptions | null;
  targetImages: Record<string, string | null>;
  flashSale: CatalogProduct[];
  bestsellers: CatalogProduct[] | null;
  reviews: ReviewHighlights | null;
  storeInfo: StoreInfo | null;
  renderedAt: string;
};

type Result<T> = { data?: T; error?: unknown; response: Response };

// unlike fetchPublic, a 404 here must not turn the homepage into the not-found page
const body = async <T>(promise: Promise<Result<T>>): Promise<T> => {
  const result = await promise;
  if (!result.response.ok || result.data === undefined) throw new Error(`HTTP ${result.response.status}`);
  return result.data;
};

// one broken API call hides its own section and never the whole page
const settle = async <T>(section: string, task: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await task();
  } catch (error) {
    console.error(`[home] ${section} failed`, error);
    return fallback;
  }
};

export async function getHomeData(): Promise<HomeData> {
  const [banners, options, flashSale, bestsellers, reviews, storeInfo] = await Promise.all([
    settle("banners", async () => (await body(homeServerApi.GET("/api/v1/home-banners"))).data, { hero: [], side: [] }),
    settle("filters", getFilterOptions, null),
    settle(
      "flash sale",
      async () =>
        (
          await body(
            freshServerApi.GET("/api/v1/products", {
              params: { query: { flashSale: true, sort: "sold_desc", pageSize: HOME_PRODUCT_LIMIT } },
            }),
          )
        ).data,
      [],
    ),
    settle(
      "bestsellers",
      async () =>
        (
          await body(
            freshServerApi.GET("/api/v1/products", {
              params: { query: { sort: "sold_desc", pageSize: HOME_PRODUCT_LIMIT } },
            }),
          )
        ).data,
      null,
    ),
    settle(
      "reviews",
      async () =>
        (await body(homeServerApi.GET("/api/v1/reviews/highlights", { params: { query: { limit: REVIEW_LIMIT } } })))
          .data,
      null,
    ),
    getStoreInfo(),
  ]);

  const targets = options?.targetOptions ?? [];
  const images = await Promise.all(
    targets.map((target) =>
      settle(
        `target ${target.value}`,
        async () =>
          (
            await body(
              homeServerApi.GET("/api/v1/products", {
                params: { query: { target: target.value, sort: "sold_desc", pageSize: 1 } },
              }),
            )
          ).data[0]?.image ?? null,
        null,
      ),
    ),
  );

  return {
    banners,
    options,
    targetImages: Object.fromEntries(targets.map((target, i) => [target.value, images[i]])),
    flashSale,
    bestsellers,
    reviews,
    storeInfo,
    renderedAt: new Date().toISOString(),
  };
}
