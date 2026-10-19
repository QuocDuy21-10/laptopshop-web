import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { App } from "antd";
import type { ReactElement } from "react";
import { vi, type Mock } from "vitest";

export function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return { client, ...render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>) };
}

export const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export function mockFetch(): Mock<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>> {
  const fn = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
  vi.stubGlobal("fetch", fn);
  return fn;
}

export const urlOf = (input: RequestInfo | URL) =>
  typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

// openapi-fetch hands fetch a Request object
export const lastRequest = (fetchMock: Mock) => {
  const calls = fetchMock.mock.calls;
  return calls[calls.length - 1][0] as Request;
};

// admin components read message/modal from antd's <App> context
export const renderAdmin = (ui: ReactElement) => renderWithQuery(<App>{ui}</App>);
