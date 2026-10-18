import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("next.config", () => {
  it("proxies the API and uploaded images to API_ORIGIN", async () => {
    const rewrites = await nextConfig.rewrites!();
    expect(rewrites).toEqual([
      { source: "/api/v1/:path*", destination: "http://localhost:8080/api/v1/:path*" },
      { source: "/images/:path*", destination: "http://localhost:8080/images/:path*" },
    ]);
  });

  it("sends security headers on every route", async () => {
    const [rule] = await nextConfig.headers!();
    expect(rule.source).toBe("/:path*");
    expect(rule.headers).toEqual(
      expect.arrayContaining([
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      ]),
    );
  });

  it("builds a standalone server for Docker", () => {
    expect(nextConfig.output).toBe("standalone");
  });
});
