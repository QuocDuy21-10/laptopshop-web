"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { AdvisorRequest } from "@/lib/api/types";

export function useAdvisor() {
  return useMutation({
    mutationFn: (input: AdvisorRequest) =>
      unwrap(api.POST("/api/v1/advisor/recommend", { body: input })),
  });
}
