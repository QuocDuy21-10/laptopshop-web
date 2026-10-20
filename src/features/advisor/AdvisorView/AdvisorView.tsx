"use client";

import { useEffect, useRef, useState } from "react";
import type { AdvisorResult } from "@/lib/api/types";
import { AdvisorForm } from "../AdvisorForm/AdvisorForm";
import { advisorFormSchema, type AdvisorFormInput } from "../schema";
import { useAdvisor } from "../hooks";
import { AdvisorResults } from "../AdvisorResults/AdvisorResults";
import styles from "./AdvisorView.module.scss";

export function AdvisorView() {
  const advisor = useAdvisor();
  const [result, setResult] = useState<AdvisorResult | null>(null);
  const [lastInput, setLastInput] = useState<AdvisorFormInput | null>(null);
  const [formKey, setFormKey] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (result) headingRef.current?.focus();
  }, [result]);

  const submit = async (input: AdvisorFormInput) => {
    setLastInput(input);
    try {
      const body = advisorFormSchema.parse(input);
      const response = await advisor.mutateAsync(body);
      setResult(response.data);
    } catch {
      // TanStack Query owns the error state; keeping the form mounted preserves the user's input.
    }
  };
  const retry = () => {
    if (lastInput) void submit(lastInput);
  };
  const edit = () => {
    advisor.reset();
    setResult(null);
    setLastInput(null);
    setFormKey((key) => key + 1);
  };

  return (
    <div className={styles.view}>
      <AdvisorForm key={formKey} onSubmit={submit} onRetry={retry} pending={advisor.isPending} serverError={advisor.error} />
      <AdvisorResults result={result} loading={advisor.isPending} onEdit={edit} headingRef={headingRef} />
    </div>
  );
}
