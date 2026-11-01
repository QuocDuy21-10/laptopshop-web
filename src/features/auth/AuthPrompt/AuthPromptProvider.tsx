"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { buttonClassName } from "@/components/ui/Button/Button";
import { Dialog } from "@/components/ui/Dialog/Dialog";
import { loginHref } from "@/lib/safe-next";
import styles from "./AuthPrompt.module.scss";

export type AuthPromptReason = "cart" | "wishlist" | "review" | "helpful";
type Prompt = { reason: AuthPromptReason; returnTo: string };

// `resumes`: the guest's action is saved and replayed after login (see PendingCartIntent / wishlist intent)
const COPY: Record<AuthPromptReason, { title: string; description: string; resumes: boolean }> = {
  cart: { title: "Đăng nhập để thêm vào giỏ hàng", description: "Giỏ hàng được lưu theo tài khoản để bạn mua trên mọi thiết bị.", resumes: true },
  wishlist: { title: "Đăng nhập để lưu sản phẩm yêu thích", description: "Lưu lại những chiếc laptop bạn quan tâm và xem lại bất cứ lúc nào.", resumes: true },
  review: { title: "Đăng nhập để đánh giá sản phẩm", description: "Chỉ khách đã mua và nhận hàng mới có thể viết đánh giá.", resumes: false },
  helpful: { title: "Đăng nhập để bình chọn hữu ích", description: "Giúp những người mua sau tìm được đánh giá đáng tin cậy.", resumes: false },
};

// without a provider (isolated tests) fall back to a plain redirect
const AuthPromptContext = createContext<(prompt: Prompt) => void>(({ returnTo }) => {
  window.location.assign(loginHref(returnTo));
});

export const useAuthPrompt = () => useContext(AuthPromptContext);

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const open = useCallback((next: Prompt) => setPrompt(next), []);
  const close = () => setPrompt(null);
  // keep the last copy while the closing animation plays
  const [shown, setShown] = useState<Prompt | null>(null);
  if (prompt && prompt !== shown) setShown(prompt);
  const copy = shown ? COPY[shown.reason] : null;

  return (
    <AuthPromptContext.Provider value={open}>
      {children}
      {copy && shown && (
        <Dialog open={prompt !== null} onOpenChange={(o) => !o && close()} title={copy.title} description={copy.description}>
          <AuthPromptActions returnTo={shown.returnTo} resumes={copy.resumes} onNavigate={close} />
        </Dialog>
      )}
    </AuthPromptContext.Provider>
  );
}

/** Sign-in / register buttons; also used by the mini cart so both prompts read the same. */
export function AuthPromptActions({ returnTo, resumes = false, onNavigate }: { returnTo: string; resumes?: boolean; onNavigate: () => void }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={styles.actions}
      initial={reduce ? false : "hidden"}
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }}
    >
      <motion.div variants={item}>
        <Link href={loginHref(returnTo)} className={buttonClassName({ fullWidth: true })} onClick={onNavigate}>
          Đăng nhập
        </Link>
      </motion.div>
      <motion.div variants={item}>
        <Link
          href={`/register?next=${encodeURIComponent(returnTo)}`}
          className={buttonClassName({ variant: "secondary", fullWidth: true })}
          onClick={onNavigate}
        >
          Tạo tài khoản
        </Link>
      </motion.div>
      {resumes && (
        <motion.p variants={item} className={styles.note}>
          Hành động của bạn sẽ được hoàn tất sau khi đăng nhập.
        </motion.p>
      )}
    </motion.div>
  );
}

const item = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } } };
