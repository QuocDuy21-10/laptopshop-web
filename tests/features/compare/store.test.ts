import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCompare,
  compareHref,
  getCompareItems,
  removeCompare,
  subscribeCompare,
  toggleCompare,
} from "@/features/compare/store";

const item = (id: number) => ({ id, name: `Laptop ${id}`, image: null });

beforeEach(() => localStorage.clear());

describe("compare store", () => {
  it("adds and removes an item", () => {
    expect(toggleCompare(item(1))).toBe("added");
    expect(getCompareItems()).toEqual([item(1)]);
    expect(toggleCompare(item(1))).toBe("removed");
    expect(getCompareItems()).toEqual([]);
  });

  it("refuses a fifth item", () => {
    [1, 2, 3, 4].forEach((id) => toggleCompare(item(id)));
    expect(toggleCompare(item(5))).toBe("full");
    expect(getCompareItems().map((i) => i.id)).toEqual([1, 2, 3, 4]);
  });

  it("treats corrupt or malformed storage as empty", () => {
    localStorage.setItem("laptopshop.compare", "{oops");
    expect(getCompareItems()).toEqual([]);
    localStorage.setItem("laptopshop.compare", JSON.stringify([{ id: "x" }]));
    expect(getCompareItems()).toEqual([]);
  });

  it("removes several ids and clears", () => {
    [1, 2, 3].forEach((id) => toggleCompare(item(id)));
    removeCompare([1, 3]);
    expect(getCompareItems()).toEqual([item(2)]);
    clearCompare();
    expect(getCompareItems()).toEqual([]);
  });

  it("returns the same snapshot while storage is unchanged", () => {
    toggleCompare(item(1));
    expect(getCompareItems()).toBe(getCompareItems());
  });

  it("notifies subscribers on writes and on storage events from other tabs", () => {
    const cb = vi.fn();
    const unsubscribe = subscribeCompare(cb);
    toggleCompare(item(1));
    expect(cb).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new StorageEvent("storage", { key: "laptopshop.compare" }));
    expect(cb).toHaveBeenCalledTimes(2);
    unsubscribe();
    toggleCompare(item(2));
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it("builds the compare link", () => {
    expect(compareHref([3, 1])).toBe("/compare?ids=3,1");
    expect(compareHref([])).toBe("/compare");
  });
});
