"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { AdvisorRequest } from "@/lib/api/types";

export type AdvisorMutationVariables = { input: AdvisorRequest; signal: AbortSignal };

export function useAdvisor() {
  return useMutation({
    mutationFn: ({ input, signal }: AdvisorMutationVariables) =>
      unwrap(api.POST("/api/v1/advisor/recommend", { body: input, signal })),
  });
}
