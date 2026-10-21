import "server-only";
import { notFound } from "next/navigation";
import createClient from "openapi-fetch";
import { env } from "@/lib/env";
import { toApiError } from "./errors";
import type { paths } from "./schema";

// openapi-fetch calls fetch(Request), so Next cache options are injected here.
export const catalogFetch = (request: Request) => fetch(request, { next: { revalidate: 3600 } });
export const freshFetch = (request: Request) => fetch(request, { cache: "no-store" });

export const catalogServerApi = createClient<paths>({
  baseUrl: env.API_ORIGIN,
  fetch: catalogFetch,
});
export const freshServerApi = createClient<paths>({ baseUrl: env.API_ORIGIN, fetch: freshFetch });
export const serverApi = freshServerApi;

type Result<T> = { data?: T; error?: unknown; response: Response };

export async function fetchPublic<T>(promise: Promise<Result<T>>): Promise<T> {
  const result = await promise;
  if (result.response.status === 404) notFound();
  if (result.error !== undefined || !result.response.ok) {
    throw toApiError(result.response.status, result.error);
  }
  return result.data as T;
}
