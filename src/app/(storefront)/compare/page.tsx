import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container/Container";
import { CompareView } from "@/features/compare/CompareView/CompareView";
import styles from "./page.module.scss";

export const metadata: Metadata = { title: "So sánh laptop", robots: { index: false } };

// CompareView reads useSearchParams, which needs a Suspense boundary for static rendering
export default function ComparePage() {
  return (
    <Container className={styles.page}>
      <Suspense>
        <CompareView />
      </Suspense>
    </Container>
  );
}
