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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const requestSeq = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (result) headingRef.current?.focus();
  }, [result]);

  useEffect(() => () => {
    requestSeq.current += 1;
    controllerRef.current?.abort();
  }, []);

  const submit = async (input: AdvisorFormInput) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    const seq = ++requestSeq.current;
    const controller = new AbortController();
    controllerRef.current?.abort();
    controllerRef.current = controller;
    setLastInput(input);
    setResult(null);
    try {
      const body = advisorFormSchema.parse(input);
      const response = await advisor.mutateAsync({ input: body, signal: controller.signal });
      if (seq === requestSeq.current && !controller.signal.aborted) setResult(response.data);
    } catch {
      if (controller.signal.aborted && seq === requestSeq.current) advisor.reset();
      // TanStack Query owns non-abort error state; keeping the form mounted preserves the user's input.
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        submittingRef.current = false;
      }
    }
  };
  const retry = () => {
    if (lastInput) void submit(lastInput);
  };
  const edit = () => {
    requestSeq.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    submittingRef.current = false;
    advisor.reset();
    setResult(null);
  };

  const showResults = advisor.isPending || result !== null;

  return (
    <div className={styles.view}>
      {/* hidden, not unmounted, so "Sửa tiêu chí" keeps the user's answers */}
      <div hidden={showResults}>
        <AdvisorForm onSubmit={submit} onRetry={retry} pending={advisor.isPending} serverError={advisor.error} />
      </div>
      <AdvisorResults result={result} loading={advisor.isPending} onEdit={edit} headingRef={headingRef} />
    </div>
  );
}
