import { apiUrl, authFetch } from "./client";
import { ApiError, toApiError } from "./errors";

// fetch instead of a plain link so an expired access token is refreshed first
export async function downloadCsv(path: string, query: Record<string, string | number | undefined>): Promise<string> {
  const url = new URL(apiUrl(path));
  for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  let res: Response;
  try {
    res = await authFetch(new Request(url));
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Network error");
  }
  if (!res.ok) throw toApiError(res.status, await res.json().catch(() => null));
  const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? "export.csv";
  const href = URL.createObjectURL(await res.blob());
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  link.click();
  URL.revokeObjectURL(href);
  return name;
}
