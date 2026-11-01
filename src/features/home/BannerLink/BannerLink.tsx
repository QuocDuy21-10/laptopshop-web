import Link from "next/link";
import type { ReactNode } from "react";

// the API only stores an internal path or an https URL for banner links
export function BannerLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return href.startsWith("/") ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className} rel="noopener">
      {children}
    </a>
  );
}
