import { beforeEach, describe, expect, it, vi } from "vitest";
import { authFetch, setSessionExpiredHandler } from "@/lib/api/client";
import { json, mockFetch, urlOf } from "../utils";

const req = (path: string, init?: RequestInit) => new Request(`http://localhost:3000${path}`, init);
const isRefresh = (input: RequestInfo | URL) => urlOf(input).endsWith("/api/v1/auth/refresh");

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
  setSessionExpiredHandler(() => {});
});

describe("authFetch", () => {
  it("passes through responses that are not 401", async () => {
    fetchMock.mockResolvedValue(json(200, { data: 1 }));
    expect((await authFetch(req("/api/v1/cart"))).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes once and retries the original request, body included", async () => {
    const bodies: string[] = [];
    let attempts = 0;
    fetchMock.mockImplementation(async (input) => {
      if (isRefresh(input)) return json(200);
      bodies.push(await (input as Request).text());
      attempts += 1;
      return attempts === 1 ? json(401) : json(200, { data: "ok" });
    });
    const res = await authFetch(req("/api/v1/cart/items", { method: "POST", body: '{"productId":1}' }));
    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls.filter(([i]) => isRefresh(i))).toHaveLength(1);
    expect(bodies).toEqual(['{"productId":1}', '{"productId":1}']);
  });

  it("shares one refresh between concurrent 401s", async () => {
    let refreshCalls = 0;
    const seen = new Map<string, number>();
    fetchMock.mockImplementation(async (input) => {
      if (isRefresh(input)) {
        refreshCalls += 1;
        await new Promise((r) => setTimeout(r, 10));
        return json(200);
      }
      const url = urlOf(input);
      const n = (seen.get(url) ?? 0) + 1;
      seen.set(url, n);
      return n === 1 ? json(401) : json(200);
    });
    const [a, b] = await Promise.all([authFetch(req("/api/v1/cart")), authFetch(req("/api/v1/users/me"))]);
    expect([a.status, b.status]).toEqual([200, 200]);
    expect(refreshCalls).toBe(1);
  });

  it("reports an expired session when the refresh fails, without retrying", async () => {
    const onExpired = vi.fn();
    setSessionExpiredHandler(onExpired);
    fetchMock.mockResolvedValue(json(401));
    const res = await authFetch(req("/api/v1/cart"));
    expect(res.status).toBe(401);
    expect(onExpired).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("never refreshes for auth endpoints", async () => {
    fetchMock.mockResolvedValue(json(401));
    await authFetch(req("/api/v1/auth/login", { method: "POST" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
