// only same-site paths: rejects absolute URLs and protocol-relative //host or /\host
export function safeNext(value?: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }
  return value;
}

export const loginHref = (next: string) => `/login?next=${encodeURIComponent(next)}`;
