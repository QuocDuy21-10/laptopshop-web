"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { ForgotPasswordInput, LoginInput, RegisterInput } from "./schemas";

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => unwrap(api.POST("/api/v1/auth/login", { body: input })),
    onSuccess: () => qc.resetQueries(),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => unwrap(api.POST("/api/v1/auth/register", { body: input })),
    onSuccess: () => qc.resetQueries(),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => unwrap(api.POST("/api/v1/auth/forgot-password", { body: input })),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { username: string; code: string; password: string; confirmPassword: string }) =>
      unwrap(api.POST("/api/v1/auth/reset-password", { body: input })),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(api.POST("/api/v1/auth/logout")),
    onSettled: () => {
      qc.clear();
      qc.setQueryData(queryKeys.me, null);
    },
  });
}
