import { act, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import { useAddWishlistItem, useConfigurePriceAlert, useWishlistStatus } from "@/features/wishlist/hooks";
import { queryKeys } from "@/lib/api/query-keys";
import { json, mockFetch, renderWithQuery, urlOf } from "../../utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

function StatusHarness({ userId }: { userId?: number }) {
  const query = useWishlistStatus(userId, [2, 1, 2]);
  const add = useAddWishlistItem(userId);
  return (
    <>
      <output data-testid="state">{userId === undefined ? "idle" : query.isPending ? "pending" : query.data?.map((item) => `${item.productId}:${item.isWishlisted}`).join(",") ?? "idle"}</output>
      <button type="button" onClick={() => add.mutate(1)}>Add</button>
    </>
  );
}

describe("wishlist query hooks", () => {
  beforeEach(() => mockFetch());

  it("does not fetch private status anonymously", async () => {
    const fetchMock = mockFetch();
    renderWithQuery(<StatusHarness />);
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("idle"));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("canonicalizes status ids and uses one batch request", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(200, { data: [{ productId: 1, isWishlisted: false }, { productId: 2, isWishlisted: true }] }));
    renderWithQuery(<StatusHarness userId={7} />);
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("1:false,2:true"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestUrl = new URL(urlOf(fetchMock.mock.calls[0][0]));
    expect(requestUrl.searchParams.getAll("productIds")).toEqual(["1", "2"]);
  });

  it("rolls an optimistic add back when the mutation fails", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(json(200, { data: [{ productId: 1, isWishlisted: false }] }));
    fetchMock.mockResolvedValueOnce(json(500, { error: { code: "UNKNOWN", message: "failed" } }));
    renderWithQuery(<StatusHarness userId={7} />);
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("1:false"));
    await userEvent.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("1:false"));
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("uses a user-scoped configure mutation and invalidates wishlist queries", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(200, { data: { id: 1 } }));
    function Harness() {
      const configure = useConfigurePriceAlert(7);
      return <button type="button" onClick={() => configure.mutate({ productId: 3, input: { mode: "PERCENT_DROP" } })}>Configure</button>;
    }
    const { client } = renderWithQuery(<Harness />);
    client.setQueryData(queryKeys.wishlist(7, 1), { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } });
    await userEvent.click(screen.getByRole("button", { name: "Configure" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(urlOf(fetchMock.mock.calls[0][0])).toContain("/api/v1/wishlist/items/3");
  });

  it("rolls back only the failed product when mutations finish out of order", async () => {
    const fetchMock = mockFetch();
    const pending: Array<{ resolve: (response: Response) => void }> = [];
    fetchMock.mockImplementation(async (input, init) => {
      const method = input instanceof Request ? input.method : init?.method;
      if (method === "PUT") {
        return new Promise<Response>((resolve) => pending.push({ resolve }));
      }
      throw new Error("unexpected request");
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const statusKey = queryKeys.wishlistStatus(7, [1, 2]);
    const listKey = queryKeys.wishlist(7, 1);
    client.setQueryData(statusKey, [{ productId: 1, isWishlisted: false }, { productId: 2, isWishlisted: false }]);
    client.setQueryData(queryKeys.wishlistSummary(7), { itemCount: 0 });
    client.setQueryData(listKey, { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } });
    const { result } = renderHook(() => useAddWishlistItem(7), { wrapper });

    let first!: Promise<unknown>;
    let second!: Promise<unknown>;
    await act(async () => {
      first = result.current.mutateAsync(1);
      second = result.current.mutateAsync(2);
    });
    client.setQueryData(listKey, { data: [{ id: 99 }], meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 } });
    pending[1].resolve(json(200, { data: {} }));
    pending[0].resolve(json(500, { error: { code: "UNKNOWN", message: "failed" } }));
    await expect(second).resolves.toBeDefined();
    await expect(first).rejects.toBeDefined();

    expect(client.getQueryData(statusKey)).toEqual([
      { productId: 1, isWishlisted: false },
      { productId: 2, isWishlisted: true },
    ]);
    expect(client.getQueryData(queryKeys.wishlistSummary(7))).toEqual({ itemCount: 1 });
    expect(client.getQueryData(listKey)).toMatchObject({ data: [{ id: 99 }] });
  });

  it("does not let an older same-product failure rollback a newer success", async () => {
    const fetchMock = mockFetch();
    const pending: Array<{ resolve: (response: Response) => void }> = [];
    fetchMock.mockImplementation(async (input, init) => {
      const method = input instanceof Request ? input.method : init?.method;
      if (method === "PUT") {
        return new Promise<Response>((resolve) => pending.push({ resolve }));
      }
      throw new Error("unexpected request");
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const statusKey = queryKeys.wishlistStatus(7, [1]);
    client.setQueryData(statusKey, [{ productId: 1, isWishlisted: false }]);
    client.setQueryData(queryKeys.wishlistSummary(7), { itemCount: 0 });
    const { result } = renderHook(() => useAddWishlistItem(7), { wrapper });

    let older!: Promise<unknown>;
    let newer!: Promise<unknown>;
    await act(async () => {
      older = result.current.mutateAsync(1);
      newer = result.current.mutateAsync(1);
    });
    pending[1].resolve(json(200, { data: {} }));
    pending[0].resolve(json(500, { error: { code: "UNKNOWN", message: "failed" } }));
    await expect(newer).resolves.toBeDefined();
    await expect(older).rejects.toBeDefined();

    expect(client.getQueryData(statusKey)).toEqual([{ productId: 1, isWishlisted: true }]);
    expect(client.getQueryData(queryKeys.wishlistSummary(7))).toEqual({ itemCount: 1 });
  });
});
