"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { NewsletterSubscribeInput } from "./schemas";

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: (input: NewsletterSubscribeInput) => unwrap(api.POST("/api/v1/newsletter/subscribe", { body: input })),
  });
}

export function useConfirmNewsletter() {
  return useMutation({
    mutationFn: (input: { token: string }) => unwrap(api.POST("/api/v1/newsletter/confirm", { body: input })),
  });
}

export function useUnsubscribeNewsletter() {
  return useMutation({
    mutationFn: (input: { token: string }) => unwrap(api.POST("/api/v1/newsletter/unsubscribe", { body: input })),
  });
}
