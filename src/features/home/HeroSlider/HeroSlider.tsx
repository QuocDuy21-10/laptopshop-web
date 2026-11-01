"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { buttonClassName } from "@/components/ui/Button/Button";
import type { PublicHomeBanner } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { BannerLink } from "../BannerLink/BannerLink";
import styles from "./HeroSlider.module.scss";

const SWIPE_PX = 40;

// No autoplay (DESIGN.md: decorative carousels never move on their own); the shopper changes slides.
export function HeroSlider({ slides }: { slides: PublicHomeBanner[] }) {
  const [current, setCurrent] = useState(0);
  const startX = useRef<number | null>(null);
  const total = slides.length;
  const many = total > 1;
  const slide = slides[current] ?? slides[0];
  const go = (index: number) => setCurrent((index + total) % total);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      e.currentTarget.focus();
      go(current - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      e.currentTarget.focus();
      go(current + 1);
    }
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) >= SWIPE_PX) go(current + (dx < 0 ? 1 : -1));
  };

  const hasPrimary = Boolean(slide.ctaText && slide.linkUrl);
  const hasSecondary = Boolean(slide.secondaryCtaText && slide.secondaryLinkUrl);

  return (
    <div
      className={styles.slider}
      role="region"
      aria-roledescription="carousel"
      aria-label="Banner nổi bật"
      tabIndex={many ? 0 : undefined}
      onKeyDown={many ? onKeyDown : undefined}
      onPointerDown={many ? onPointerDown : undefined}
      onPointerUp={many ? onPointerUp : undefined}
    >
      <div
        key={slide.id}
        className={cx(styles.slide, !slide.imageUrl && styles.textOnly)}
        role="group"
        aria-roledescription="slide"
        aria-label={`${current + 1} / ${total}`}
      >
        <div className={styles.copy}>
          {slide.eyebrow && <p className={styles.eyebrow}>{slide.eyebrow}</p>}
          <h1 className={styles.title}>
            {slide.title}
            {slide.highlight && (
              <>
                {" "}
                <span className={styles.highlight}>{slide.highlight}</span>
              </>
            )}
          </h1>
          {slide.description && <p className={styles.description}>{slide.description}</p>}
          {(hasPrimary || hasSecondary) && (
            <div className={styles.actions}>
              {hasPrimary && (
                <BannerLink href={slide.linkUrl!} className={buttonClassName({ size: "lg" })}>
                  {slide.ctaText}
                </BannerLink>
              )}
              {hasSecondary && (
                <BannerLink
                  href={slide.secondaryLinkUrl!}
                  className={buttonClassName({ variant: "secondary", size: "lg" })}
                >
                  {slide.secondaryCtaText}
                </BannerLink>
              )}
            </div>
          )}
        </div>
        {slide.imageUrl && (
          <div className={styles.visual}>
            <Image
              src={slide.imageUrl}
              alt={slide.imageAlt ?? ""}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              priority={current === 0}
              unoptimized
              className={styles.image}
            />
            {slide.badges.length > 0 && (
              <ul role="list" className={styles.badges}>
                {slide.badges.map((badge) => (
                  <li key={badge} className={styles.badge}>
                    {badge}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {many && (
        <>
          <button
            type="button"
            className={cx(styles.nav, styles.prev)}
            aria-label="Slide trước"
            onClick={() => go(current - 1)}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cx(styles.nav, styles.next)}
            aria-label="Slide tiếp theo"
            onClick={() => go(current + 1)}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          <div className={styles.dots}>
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={cx(styles.dot, i === current && styles.dotActive)}
                aria-label={`Chuyển tới slide ${i + 1}`}
                aria-current={i === current ? "true" : undefined}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
