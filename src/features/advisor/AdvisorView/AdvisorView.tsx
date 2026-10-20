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
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (result) headingRef.current?.focus();
  }, [result]);

  const submit = async (input: AdvisorFormInput) => {
    const body = advisorFormSchema.parse(input);
    const response = await advisor.mutateAsync(body);
    setResult(response.data);
  };

  return (
    <div className={styles.view}>
      <AdvisorForm onSubmit={submit} pending={advisor.isPending} serverError={advisor.error} />
      <AdvisorResults result={result} loading={advisor.isPending} onEdit={() => setResult(null)} headingRef={headingRef} />
    </div>
  );
}
