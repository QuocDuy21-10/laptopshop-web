"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const ADMIN_PAGE_SIZE = 10;

// list state lives in the URL so reload and back keep page and filters
export function useListParams() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const n = Math.trunc(Number(search.get("page")));

  const set = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(search);
    if (!("page" in patch)) next.delete("page");
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, String(value));
    }
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return { get: (key: string) => search.get(key) ?? undefined, page: n > 0 ? n : 1, set };
}
