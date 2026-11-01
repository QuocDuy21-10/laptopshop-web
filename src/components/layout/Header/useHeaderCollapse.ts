"use client";

import { useEffect, useState, type RefObject } from "react";

export function useHeaderCollapse(headerRef: RefObject<HTMLElement | null>): boolean {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const readY = () => Math.max(0, window.scrollY);
    let previousY = readY();
    let hidden = false;
    let frame: number | null = null;

    const update = (next: boolean) => {
      if (next === hidden) return;
      hidden = next;
      setCollapsed(next);
    };
    const evaluate = () => {
      frame = null;
      const y = readY();
      if (
        !desktop.matches ||
        y <= 120 ||
        header.contains(document.activeElement) ||
        y < previousY
      ) {
        update(false);
      } else if (y > previousY) {
        update(true);
      }
      previousY = y;
    };
    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(evaluate);
    };
    const reveal = () => {
      previousY = readY();
      update(false);
    };
    const onFocusOut = () => {
      previousY = readY();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    desktop.addEventListener("change", reveal);
    header.addEventListener("focusin", reveal);
    header.addEventListener("focusout", onFocusOut);
    return () => {
      window.removeEventListener("scroll", onScroll);
      desktop.removeEventListener("change", reveal);
      header.removeEventListener("focusin", reveal);
      header.removeEventListener("focusout", onFocusOut);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [headerRef]);

  return collapsed;
}
