import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const homeGet = vi.fn();
const freshGet = vi.fn();
vi.mock("@/lib/api/server", () => ({
  homeServerApi: { GET: homeGet },
  freshServerApi: { GET: freshGet },
}));
const getFilterOptions = vi.fn();
vi.mock("@/features/products/server", () => ({ getFilterOptions }));
const getStoreInfo = vi.fn();
vi.mock("@/features/store-info/server", () => ({ getStoreInfo }));

const { getHomeData } = await import("@/features/home/server");

const ok = (data: unknown) => Promise.resolve({ data, response: new Response(null, { status: 200 }) });
const fail = (status = 500) =>
  Promise.resolve({ error: { error: { code: "X" } }, response: new Response(null, { status }) });
const product = (id: number, image: string | null = `/images/product/${id}.png`) => ({ id, name: `P${id}`, image });

beforeEach(() => {
  homeGet.mockReset();
  freshGet.mockReset();
  getFilterOptions.mockReset().mockResolvedValue({
    factoryOptions: [],
    targetOptions: [
      { name: "Gaming", value: "GAMING" },
      { name: "Mỏng nhẹ", value: "MONG_NHE" },
    ],
  });
  getStoreInfo
    .mockReset()
    .mockResolvedValue({ hotline: "1900", supportEmail: null, supportHours: null, vatInvoice: true, paymentMethods: ["COD"] });
});

const route = (path: string, query: Record<string, unknown> = {}) => {
  if (path === "/api/v1/home-banners") return ok({ data: { hero: [{ id: 1 }], side: [] } });
  if (path === "/api/v1/reviews/highlights")
    return ok({ data: { summary: { averageRating: 4.5, totalReviews: 2 }, items: [] } });
  if (path === "/api/v1/products" && query.target === "GAMING") return ok({ data: [product(9)] });
  if (path === "/api/v1/products" && query.target === "MONG_NHE") return ok({ data: [] });
  return fail();
};

describe("getHomeData", () => {
  it("loads every section with the right queries", async () => {
    homeGet.mockImplementation((path: string, init?: { params?: { query?: Record<string, unknown> } }) =>
      route(path, init?.params?.query),
    );
    freshGet.mockImplementation((_path: string, init: { params: { query: Record<string, unknown> } }) =>
      init.params.query.flashSale ? ok({ data: [product(1)] }) : ok({ data: [product(2), product(3)] }),
    );

    const data = await getHomeData();

    expect(data.banners.hero).toHaveLength(1);
    expect(data.flashSale.map((p) => p.id)).toEqual([1]);
    expect(data.bestsellers?.map((p) => p.id)).toEqual([2, 3]);
    expect(data.targetImages).toEqual({ GAMING: "/images/product/9.png", MONG_NHE: null });
    expect(data.reviews?.summary.totalReviews).toBe(2);
    expect(data.storeInfo?.hotline).toBe("1900");
    expect(freshGet).toHaveBeenCalledWith("/api/v1/products", {
      params: { query: { flashSale: true, sort: "sold_desc", pageSize: 8 } },
    });
    expect(freshGet).toHaveBeenCalledWith("/api/v1/products", {
      params: { query: { sort: "sold_desc", pageSize: 8 } },
    });
    expect(homeGet).toHaveBeenCalledWith("/api/v1/products", {
      params: { query: { target: "GAMING", sort: "sold_desc", pageSize: 1 } },
    });
    expect(homeGet).toHaveBeenCalledWith("/api/v1/reviews/highlights", { params: { query: { limit: 6 } } });
    expect(Number.isNaN(Date.parse(data.renderedAt))).toBe(false);
  });

  it("isolates failures: each broken call only empties its own section", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    homeGet.mockImplementation(() => fail(503));
    freshGet.mockImplementation(() => Promise.reject(new Error("network")));
    getFilterOptions.mockRejectedValue(new Error("down"));
    getStoreInfo.mockResolvedValue(null);

    const data = await getHomeData();

    expect(data).toMatchObject({
      banners: { hero: [], side: [] },
      options: null,
      targetImages: {},
      flashSale: [],
      bestsellers: null,
      reviews: null,
      storeInfo: null,
    });
  });
});
