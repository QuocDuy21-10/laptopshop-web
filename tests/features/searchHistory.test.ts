import { beforeEach, describe, expect, it } from "vitest";

import { addSearch, clearSearches, readSearches, removeSearch } from "@/features/products/searchHistory";

describe("searchHistory", () => {
  beforeEach(() => window.localStorage.clear());

  it("keeps the newest first and drops case-insensitive duplicates", () => {
    addSearch("asus");
    addSearch("Dell");
    expect(addSearch("ASUS")).toEqual(["ASUS", "Dell"]);
  });

  it("ignores blanks and caps the list at five", () => {
    addSearch("  ");
    for (const t of ["a1", "b2", "c3", "d4", "e5", "f6"]) addSearch(t);
    expect(readSearches()).toEqual(["f6", "e5", "d4", "c3", "b2"]);
  });

  it("removes one entry or all of them", () => {
    addSearch("a1");
    addSearch("b2");
    expect(removeSearch("a1")).toEqual(["b2"]);
    expect(clearSearches()).toEqual([]);
  });

  it("survives corrupt stored data", () => {
    window.localStorage.setItem("recent-searches", "{oops");
    expect(readSearches()).toEqual([]);
  });
});
