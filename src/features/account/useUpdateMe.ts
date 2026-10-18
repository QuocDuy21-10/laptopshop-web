"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl, authFetch } from "@/lib/api/client";
import { ApiError, toApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { ProfileInput } from "./schema";

// multipart goes through authFetch directly so the browser sets the boundary header
async function patchMe(values: ProfileInput, avatar?: File) {
  const form = new FormData();
  form.set("fullName", values.fullName);
  form.set("phone", values.phone);
  form.set("address", values.address);
  if (avatar) form.set("avatar", avatar);
  let res: Response;
  try {
    res = await authFetch(new Request(apiUrl("/api/v1/users/me"), { method: "PATCH", body: form }));
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Network error");
  }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) throw toApiError(res.status, body);
  return body;
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ values, avatar }: { values: ProfileInput; avatar?: File }) => patchMe(values, avatar),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}
