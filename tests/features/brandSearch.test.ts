import { describe, expect, it } from "vitest";
import { brandForQuery } from "@/features/products/brandSearch";

const brands = [
  { value: "APPLE", name: "Apple (MacBook)" },
  { value: "ASUS", name: "Asus" },
  { value: "DELL", name: "Dell" },
];

describe("brandForQuery", () => {
  it("matches a brand by value or any word of its label, ignoring case", () => {
    expect(brandForQuery("asus", brands)?.value).toBe("ASUS");
    expect(brandForQuery("  MacBook ", brands)?.value).toBe("APPLE");
    expect(brandForQuery("apple", brands)?.value).toBe("APPLE");
  });

  it("ignores multi-word, short and unrelated queries", () => {
    expect(brandForQuery("asus tuf", brands)).toBeUndefined();
    expect(brandForQuery("a", brands)).toBeUndefined();
    expect(brandForQuery("lenovo", brands)).toBeUndefined();
    expect(brandForQuery(undefined, brands)).toBeUndefined();
  });
});
