import type { Metadata } from "next";
import type { ReactNode } from "react";

// the page is a client component and cannot export metadata itself
export const metadata: Metadata = { title: "Yêu cầu hậu mãi" };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
