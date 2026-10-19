import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/SiteShell/SiteShell";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
