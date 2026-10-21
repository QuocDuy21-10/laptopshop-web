import type { Metadata } from "next";

type Raw = Record<string, string | string[] | undefined>;

export function productsMetadata(raw: Raw): Metadata {
  const hasQuery = Object.entries(raw).some(([key, value]) => {
    if (value === undefined || value === "") return false;
    if (key === "page") return Number(value) > 1;
    return true;
  });
  return {
    title: "Laptop",
    robots: { index: !hasQuery, follow: true },
    alternates: { canonical: "/products" },
  };
}
