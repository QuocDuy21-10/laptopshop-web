import { apiUrl, authFetch } from "./client";
import { ApiError, toApiError } from "./errors";

// null/undefined are left out so a PATCH only touches the fields the form sent
export function toFormData(
  fields: Record<string, string | number | null | undefined>,
  files: Record<string, File | File[] | undefined> = {},
): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) if (value !== undefined && value !== null) form.set(key, String(value));
  for (const [key, file] of Object.entries(files)) {
    if (Array.isArray(file)) for (const item of file) form.append(key, item);
    else if (file) form.set(key, file);
  }
  return form;
}

// multipart goes through authFetch directly so the browser sets the boundary header
export async function sendMultipart<T = unknown>(path: string, method: "POST" | "PATCH", form: FormData): Promise<T> {
  let res: Response;
  try {
    res = await authFetch(new Request(apiUrl(path), { method, body: form }));
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Network error");
  }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) throw toApiError(res.status, body);
  return body as T;
}
