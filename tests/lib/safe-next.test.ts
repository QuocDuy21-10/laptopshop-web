import { describe, expect, it } from "vitest";
import { loginHref, safeNext } from "@/lib/safe-next";
import { isGuardedPath } from "@/lib/guarded-routes";

describe("safeNext", () => {
  it.each([
    ["/checkout", "/checkout"],
    ["/products?q=asus", "/products?q=asus"],
    ["https://evil.example", "/"],
    ["//evil.example", "/"],
    ["/\\evil.example", "/"],
    ["", "/"],
    [null, "/"],
  ])("%s -> %s", (input, expected) => {
    expect(safeNext(input)).toBe(expected);
  });

  it("encodes the next path", () => {
    expect(loginHref("/checkout?x=1")).toBe("/login?next=%2Fcheckout%3Fx%3D1");
  });
});

describe("isGuardedPath", () => {
  it("matches guarded prefixes only", () => {
    expect(isGuardedPath("/cart")).toBe(true);
    expect(isGuardedPath("/account/orders/3")).toBe(true);
    expect(isGuardedPath("/accounting")).toBe(false);
    expect(isGuardedPath("/products")).toBe(false);
  });
});
