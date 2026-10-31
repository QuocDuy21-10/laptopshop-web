"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { useAuthPrompt } from "@/features/auth/AuthPrompt/AuthPromptProvider";
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
  const promptLogin = useAuthPrompt();
  const active = optimistic?.active ?? helpful;
  const currentCount = optimistic?.count ?? count;
  if (!userId) {
    return <Button variant="secondary" className={styles.button} onClick={() => promptLogin({ reason: "helpful", returnTo: `/products/${productId}#reviews` })}>Hữu ích ({currentCount})</Button>;
  }
  const toggle = () => {
    if (selfVoteDisabled || mutation.isPending) return;
    const next = !active;
    setOptimistic({ active: next, count: currentCount + (next ? 1 : -1) });
    mutation.mutate({ reviewId, helpful: next }, {
      onError: () => {
        setOptimistic(null);
      },
      onSuccess: () => {
        setOptimistic(null);
      },
    });
  };
  if (selfVoteDisabled) {
    return <div className={styles.wrapper}><Button variant="secondary" disabled aria-pressed={active} aria-label="Không thể đánh dấu hữu ích">Hữu ích ({currentCount})</Button><span className={styles.hint}>Bạn không thể tự đánh giá review của mình.</span></div>;
  }
  return <Button variant="secondary" className={styles.button} aria-pressed={active} aria-label={`${active ? "Bỏ đánh dấu hữu ích" : "Đánh dấu hữu ích"} (${currentCount})`} loading={mutation.isPending} onClick={toggle}>Hữu ích ({currentCount})</Button>;
}
