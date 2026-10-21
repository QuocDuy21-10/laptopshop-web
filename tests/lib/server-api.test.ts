import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockFetch } from "../utils";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({ env: { API_ORIGIN: "http://api.test" } }));

const { catalogFetch, freshFetch } = await import("@/lib/api/server");

describe("server API cache adapters", () => {
  beforeEach(() => mockFetch().mockResolvedValue(new Response(null, { status: 200 })));

  it("uses one-hour cache for catalog requests", async () => {
    const fetchMock = mockFetch().mockResolvedValue(new Response(null, { status: 200 }));
    const request = new Request("http://api.test/api/v1/products/filters");
    await catalogFetch(request);
    expect(fetchMock).toHaveBeenCalledWith(request, { next: { revalidate: 3600 } });
  });

  it("uses no-store for list and facet requests", async () => {
    const fetchMock = mockFetch().mockResolvedValue(new Response(null, { status: 200 }));
    const request = new Request("http://api.test/api/v1/products/facets");
    await freshFetch(request);
    expect(fetchMock).toHaveBeenCalledWith(request, { cache: "no-store" });
  });
});
