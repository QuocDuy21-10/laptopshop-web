"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { paths } from "@/lib/api/schema";

export type NewsletterSubscriberQuery = NonNullable<
  paths["/api/v1/admin/newsletter/subscribers"]["get"]["parameters"]["query"]
>;

export function useAdminNewsletterSubscribers(query: NewsletterSubscriberQuery) {
  return useQuery({
    queryKey: queryKeys.adminNewsletterSubscribers(query),
    queryFn: () => unwrap(api.GET("/api/v1/admin/newsletter/subscribers", { params: { query } })),
    placeholderData: keepPreviousData,
  });
}
