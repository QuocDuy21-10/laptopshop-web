"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { buttonClassName } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { CompareTable } from "../CompareTable/CompareTable";
import { useCompareProducts } from "../hooks";
import { compareHref, removeCompare } from "../store";
import { useCompare } from "../useCompare";
import styles from "./CompareView.module.scss";

const missingIdsOf = (e: unknown): number[] | null => {
  if (!isApiError(e, "NOT_FOUND")) return null;
  const ids = (e.details as { missingIds?: unknown } | undefined)?.missingIds;
  return Array.isArray(ids) ? (ids as number[]) : null;
};

export function CompareView() {
  const router = useRouter();
  const raw = useSearchParams().get("ids");
  const ids = useMemo(() => (raw ? raw.split(",").map(Number) : []), [raw]);
  const selected = useCompare();
  const query = useCompareProducts(ids);
  const missing = missingIdsOf(query.error);
  const kept = useMemo(
    () => (missing ? ids.filter((id) => !missing.includes(id)) : null),
    [missing, ids],
  );
  // the ids left after dropping; the notice shows only while the URL still holds that list
  const [droppedTo, setDroppedTo] = useState<string | null>(null);
  // set while rendering (not in an effect) so the notice survives the URL replace below
  if (kept && droppedTo !== kept.join(",")) setDroppedTo(kept.join(","));
  const dropped = droppedTo !== null && droppedTo === (raw ?? "");

  // a bare /compare opens the list saved in this browser
  useEffect(() => {
    if (raw === null && selected.length >= 2) router.replace(compareHref(selected.map((i) => i.id)));
  }, [raw, selected, router]);

  useEffect(() => {
    if (!missing || !kept) return;
    removeCompare(missing);
    router.replace(compareHref(kept));
  }, [missing, kept, router]);

  const remove = (id: number) => {
    removeCompare([id]);
    router.replace(compareHref(ids.filter((x) => x !== id)));
  };

  let content;
  if (ids.length < 2) {
    content = (
      <EmptyState
        title="Chọn ít nhất 2 sản phẩm để so sánh"
        description="Bấm “So sánh” trên thẻ sản phẩm để thêm vào danh sách."
        action={
          <Link href="/products" className={buttonClassName()}>
            Xem laptop
          </Link>
        }
      />
    );
  } else if (query.isError && !missing) {
    content = (
      <Alert tone="error">
        {errorMessage(query.error)} <Link href="/products">Quay lại danh sách laptop</Link>
      </Alert>
    );
  } else if (!query.data) {
    content = <Skeleton className={styles.skeleton} />;
  } else {
    content = <CompareTable products={query.data} onRemove={remove} />;
  }

  return (
    <div className={styles.view}>
      <h1 className={styles.title}>So sánh laptop</h1>
      {dropped && (
        <Alert tone="warning">
          Một số sản phẩm không còn bán đã được bỏ khỏi danh sách so sánh.
        </Alert>
      )}
      {content}
    </div>
  );
}
