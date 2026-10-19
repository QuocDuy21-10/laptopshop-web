import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/SiteShell/SiteShell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
