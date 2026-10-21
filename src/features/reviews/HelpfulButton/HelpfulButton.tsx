"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { loginHref } from "@/lib/safe-next";
import { useToggleHelpful } from "../hooks";
import styles from "./HelpfulButton.module.scss";

type Props = {
  productId: number;
  reviewId: number;
  reviewIds: number[];
  count: number;
  helpful: boolean;
  userId?: number;
  selfVoteDisabled?: boolean;
};

export function HelpfulButton({ productId, reviewId, reviewIds, count, helpful, userId, selfVoteDisabled = false }: Props) {
  const [optimistic, setOptimistic] = useState<{ active: boolean; count: number } | null>(null);
  const mutation = useToggleHelpful(reviewIds, userId);
  const active = optimistic?.active ?? helpful;
  const currentCount = optimistic?.count ?? count;
  useEffect(() => {
    if (optimistic && optimistic.active === helpful && optimistic.count === count) {
      // Props are authoritative again after the mutation response/refetch settles.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOptimistic(null);
    }
  }, [helpful, count, optimistic]);
  if (!userId) {
    return <Link className={styles.button} href={loginHref(`/products/${productId}#reviews`)}>Hữu ích ({currentCount})</Link>;
  }
  const toggle = () => {
    if (selfVoteDisabled || mutation.isPending) return;
    const next = !active;
    const previous = { active, count: currentCount };
    setOptimistic({ active: next, count: currentCount + (next ? 1 : -1) });
    mutation.mutate({ reviewId, helpful: next }, {
      onError: () => {
        setOptimistic(previous);
      },
      onSuccess: (result) => {
        setOptimistic({ active: result.helpful, count: result.helpfulCount });
      },
    });
  };
  if (selfVoteDisabled) {
    return <div className={styles.wrapper}><Button variant="secondary" disabled aria-pressed={active} aria-label="Không thể đánh dấu hữu ích">Hữu ích ({currentCount})</Button><span className={styles.hint}>Bạn không thể tự đánh giá review của mình.</span></div>;
  }
  return <Button variant="secondary" className={styles.button} aria-pressed={active} aria-label={`${active ? "Bỏ đánh dấu hữu ích" : "Đánh dấu hữu ích"} (${currentCount})`} loading={mutation.isPending} onClick={toggle}>Hữu ích ({currentCount})</Button>;
}
