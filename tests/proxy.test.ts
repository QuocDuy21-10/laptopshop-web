// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { config, proxy } from "@/proxy";

describe("proxy", () => {
  it("sends anonymous users to login with the full next path", () => {
    const res = proxy(new NextRequest("http://localhost:3000/checkout?step=1"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?next=%2Fcheckout%3Fstep%3D1");
  });

  it("lets requests with an access token through", () => {
    const req = new NextRequest("http://localhost:3000/cart", { headers: { cookie: "access_token=x" } });
    expect(proxy(req).headers.get("x-middleware-next")).toBe("1");
  });

  it("guards cart, checkout, wishlist, account and admin pages", () => {
    expect(config.matcher).toEqual(["/cart", "/checkout", "/wishlist", "/account/:path*", "/admin/:path*"]);
  });
});
