import type { ReactNode } from "react";
import { AccountNav } from "@/components/layout/AccountNav/AccountNav";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AccountNav />
      {children}
    </>
  );
}
