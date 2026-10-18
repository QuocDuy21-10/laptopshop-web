import "server-only";
import { notFound } from "next/navigation";
import createClient from "openapi-fetch";
import { env } from "@/lib/env";
import { toApiError } from "./errors";
import type { paths } from "./schema";

// openapi-fetch calls fetch(Request), so cache options must be injected here
export const serverApi = createClient<paths>({
  baseUrl: env.API_ORIGIN,
  fetch: (request) => fetch(request, { next: { revalidate: 60 } }),
});

type Result<T> = { data?: T; error?: unknown; response: Response };

export async function fetchPublic<T>(promise: Promise<Result<T>>): Promise<T> {
  const result = await promise;
  if (result.response.status === 404) notFound();
  if (result.error !== undefined || !result.response.ok) {
    throw toApiError(result.response.status, result.error);
  }
  return result.data as T;
}
