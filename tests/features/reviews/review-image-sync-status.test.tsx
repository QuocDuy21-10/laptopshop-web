import { clearReviewImageSyncBudget } from "@/features/reviews/review-image-sync-budget";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, screen, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useBoundedReviewImageSyncStatus } from "@/features/reviews/hooks";
import { json, mockFetch, renderWithQuery } from "../../utils";

const processing = {
  reviewId: 18,
  status: "PROCESSING",
  retryable: true,
  expectedVersion: 7,
  updatedAt: "2026-10-31T00:00:00Z",
  retryAfterMs: 500,
};
function Harness({ userId = 7 }: { userId?: number }) {
  const [enabled, setEnabled] = useState(true);
  const query = useBoundedReviewImageSyncStatus({
    scope: { userId, productId: 12, reviewId: 18 },
    idempotencyKey: "original-key",
    enabled,
  });
  return (
    <>
      <output>
        {query.data?.status ?? "none"}/{String(query.isError)}
      </output>
      <span data-testid="timeout">{String(query.timedOut)}</span>
      <button onClick={() => setEnabled((value) => !value)}>Toggle</button>
      <button onClick={() => void query.checkAgain()}>Check</button>
    </>
  );
}
beforeEach(() => {
  sessionStorage.clear();
  for (const userId of [7, 8])
    for (const key of ["original-key", "legacy-key"])
      clearReviewImageSyncBudget({ userId, reviewId: 18 }, key);
  vi.useFakeTimers();
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
it("polls PROCESSING and stops on HTTP 200 SUCCEEDED", async () => {
  const fetchMock = mockFetch()
    .mockResolvedValueOnce(json(200, { data: processing }))
    .mockResolvedValue(
      json(200, {
        data: {
          ...processing,
          status: "SUCCEEDED",
          result: { reviewId: 18, imageVersion: 8, images: [], replayed: true },
        },
      }),
    );
  renderWithQuery(<Harness />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10);
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2_010);
  });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(screen.getByRole("status")).toHaveTextContent("SUCCEEDED/false");
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60_000);
  });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("caps automatic requests and keeps the same budget across closing and reopening", async () => {
  const fetchMock = mockFetch().mockImplementation(async () =>
    json(200, { data: { ...processing, retryAfterMs: 0 } }),
  );
  renderWithQuery(<Harness />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(25_000);
  });
  expect(fetchMock).toHaveBeenCalledTimes(10);
  fireEvent.click(screen.getByText("Toggle"));
  fireEvent.click(screen.getByText("Toggle"));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(180_000);
  });
  expect(fetchMock).toHaveBeenCalledTimes(10);
});
it("treats HTTP 200 FAILED as a domain outcome and does not poll", async () => {
  const fetchMock = mockFetch().mockResolvedValue(
    json(200, {
      data: {
        ...processing,
        status: "FAILED",
        error: { code: "REVIEW_IMAGE_VERSION_CONFLICT", message: "conflict" },
      },
    }),
  );
  renderWithQuery(<Harness />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60_000);
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("status")).toHaveTextContent("FAILED/false");
});
it("honors Retry-After even on an explicit check", async () => {
  const fetchMock = mockFetch().mockResolvedValue(
    new Response(JSON.stringify({ error: { code: "TOO_MANY_REQUESTS", message: "wait" } }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "30" },
    }),
  );
  renderWithQuery(<Harness />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10);
  });
  fireEvent.click(screen.getByText("Check"));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(20_000);
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10_000);
  });
  fireEvent.click(screen.getByText("Check"));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10);
  });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("isolates the same operation key between accounts", async () => {
  const fetchMock = mockFetch().mockImplementation(async () =>
    json(200, { data: { ...processing, status: "FAILED" } }),
  );
  renderWithQuery(
    <>
      <Harness userId={7} />
      <Harness userId={8} />
    </>,
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10);
  });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
it("pauses a hidden tab and cancels polling after unmount", async () => {
  const fetchMock = mockFetch().mockImplementation(async () =>
    json(200, { data: { ...processing, retryAfterMs: 0 } }),
  );
  const view = renderWithQuery(<Harness />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10);
  });
  vi.spyOn(document, "hidden", "get").mockReturnValue(true);
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
  fireEvent(document, new Event("visibilitychange"));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60_000);
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  view.unmount();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60_000);
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
it.each([404, 0])("does not turn status %i into a terminal operation result", async (status) => {
  const fetchMock = mockFetch();
  if (status)
    fetchMock.mockImplementation(async () =>
      json(status, {
        error: { code: "REVIEW_IMAGE_SYNC_OPERATION_NOT_FOUND", message: "missing" },
      }),
    );
  else fetchMock.mockRejectedValue(new Error("offline"));
  renderWithQuery(<Harness />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60_000);
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("status")).toHaveTextContent("none/true");
});

it("keeps timeout visible after a manual PROCESSING check beyond the time window", async () => {
  const fetchMock = mockFetch().mockImplementation(async () =>
    json(200, { data: { ...processing, retryAfterMs: 120000 } }),
  );
  renderWithQuery(<Harness />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(190000);
  });
  expect(screen.getByTestId("timeout")).toHaveTextContent("true");
  fireEvent.click(screen.getByText("Check"));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10);
  });
  expect(screen.getByTestId("timeout")).toHaveTextContent("true");
  expect(fetchMock.mock.calls.length).toBeLessThanOrEqual(7);
});

it.each(["reset", "clear"])("keeps the allowance after auth cache %s", async (operation) => {
  const fetchMock = mockFetch().mockImplementation(async () =>
    json(200, { data: { ...processing, retryAfterMs: 0 } }),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30000 } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <Harness />
    </QueryClientProvider>,
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(25000);
  });
  expect(fetchMock).toHaveBeenCalledTimes(10);
  if (operation === "reset")
    await act(async () => {
      await client.resetQueries();
    });
  else {
    view.unmount();
    client.clear();
    render(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    );
  }
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10);
  });
  expect(fetchMock).toHaveBeenCalledTimes(10);
});
it("keeps Retry-After when logout clears QueryClient before account return", async () => {
  const fetchMock = mockFetch().mockImplementation(
    async () =>
      new Response(JSON.stringify({ error: { code: "TOO_MANY_REQUESTS", message: "wait" } }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "30" },
      }),
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={client}>
      <Harness />
    </QueryClientProvider>,
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10);
  });
  view.unmount();
  client.clear();
  render(
    <QueryClientProvider client={client}>
      <Harness />
    </QueryClientProvider>,
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10);
  });
  fireEvent.click(screen.getByText("Check"));
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
it("obtains fresh status after retry even under the production staleTime", async () => {
  let succeeded = false;
  const fetchMock = mockFetch().mockImplementation(async () =>
    json(200, {
      data: {
        ...processing,
        status: succeeded ? "SUCCEEDED" : "WAITING_RETRY",
        result: succeeded
          ? { reviewId: 18, imageVersion: 8, images: [], replayed: true }
          : undefined,
      },
    }),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30000 } },
  });
  render(
    <QueryClientProvider client={client}>
      <Harness />
    </QueryClientProvider>,
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10);
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText("Toggle"));
  succeeded = true;
  fireEvent.click(screen.getByText("Toggle"));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10);
  });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(screen.getByRole("status")).toHaveTextContent("SUCCEEDED/false");
});
