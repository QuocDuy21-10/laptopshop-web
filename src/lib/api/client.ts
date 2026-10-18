import createClient from "openapi-fetch";
import type { paths } from "./schema";

const origin = () => (typeof window === "undefined" ? "http://localhost" : window.location.origin);

export const apiUrl = (path: string) => new URL(path, origin()).href;

let onSessionExpired: () => void = () => {};
export const setSessionExpiredHandler = (fn: () => void) => {
  onSessionExpired = fn;
};

let refreshing: Promise<boolean> | null = null;

// single flight: the API revokes the whole session if two refreshes race
export function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(apiUrl("/api/v1/auth/refresh"), { method: "POST", credentials: "same-origin" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

const isAuthPath = (url: string) => new URL(url).pathname.startsWith("/api/v1/auth/");

export async function authFetch(request: Request): Promise<Response> {
  const retry = request.clone();
  const response = await fetch(request);
  if (response.status !== 401 || isAuthPath(request.url)) return response;
  if (!(await refreshSession())) {
    onSessionExpired();
    return response;
  }
  return fetch(retry);
}

export const api = createClient<paths>({ baseUrl: origin(), fetch: authFetch });
