import { describe, expect, it } from "vitest";
import { productsMetadata } from "@/features/products/metadata";

describe("products metadata", () => {
  it("keeps the plain products route indexable and canonical", () => {
    expect(productsMetadata({})).toMatchObject({
      robots: { index: true, follow: true },
      alternates: { canonical: "/products" },
    });
  });

  it.each([{ q: "tuf" }, { cpuBrand: "INTEL" }, { sort: "price_desc" }, { page: "2" }])(
    "noindexes query route %o",
    (raw) => {
      expect(productsMetadata(raw)).toMatchObject({
        robots: { index: false, follow: true },
        alternates: { canonical: "/products" },
      });
    },
  );
});
