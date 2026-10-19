"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMultipart, toFormData } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import type { ProfileInput } from "./schema";

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ values, avatar }: { values: ProfileInput; avatar?: File }) =>
      sendMultipart("/api/v1/users/me", "PATCH", toFormData(values, { avatar })),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}
