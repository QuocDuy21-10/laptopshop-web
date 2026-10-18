import { describe, expect, it } from "vitest";
import { parseFilters, toApiQuery, toQueryString } from "@/features/products/search-params";

const options = {
  factoryOptions: [
    { name: "Asus", value: "ASUS" },
    { name: "Dell", value: "DELL" },
  ],
  targetOptions: [{ name: "Gaming", value: "GAMING" }],
};

describe("parseFilters", () => {
  it("keeps known values and drops the rest", () => {
    const f = parseFilters(
      { factory: "ASUS,NOKIA", target: ["GAMING"], price: "under-10m,cheap", sort: "price_desc", q: "  tuf ", page: "2" },
      options,
    );
    expect(f).toEqual({ factory: ["ASUS"], target: ["GAMING"], price: ["under-10m"], sort: "price_desc", q: "tuf", page: 2 });
  });

  it("defaults sensibly", () => {
    expect(parseFilters({ page: "-3", sort: "rating" }, options)).toEqual({
      factory: [],
      target: [],
      price: [],
      sort: undefined,
      q: undefined,
      page: 1,
    });
  });
});

describe("toQueryString", () => {
  it("serialises in a stable order and omits page 1", () => {
    expect(
      toQueryString({ factory: ["ASUS", "DELL"], target: [], price: ["over-20m"], sort: "price_asc", q: "mac book", page: 1 }),
    ).toBe("?factory=ASUS%2CDELL&price=over-20m&sort=price_asc&q=mac+book");
    expect(toQueryString({ factory: [], target: [], price: [], page: 3 })).toBe("?page=3");
    expect(toQueryString({ factory: [], target: [], price: [], page: 1 })).toBe("");
  });
});

describe("toApiQuery", () => {
  it("joins lists and sets the page size", () => {
    expect(toApiQuery({ factory: ["ASUS"], target: [], price: [], q: "tuf", page: 2 })).toEqual({
      page: 2,
      pageSize: 12,
      factory: "ASUS",
      q: "tuf",
    });
  });
});
