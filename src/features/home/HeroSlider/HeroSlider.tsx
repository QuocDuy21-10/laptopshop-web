"use client";

import { useCallback, useEffect, useRef, useState, type FC, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LaptopMockup, type LaptopVariant } from "../LaptopMockup/LaptopMockup";
import styles from "./HeroSlider.module.scss";

export interface HeroSlide {
  id: number;
  tag: string;
  title: string;
  highlight: string;
  desc: string;
  ctaText: string;
  ctaLink: string;
  secondaryText: string;
  secondaryLink: string;
  floatingBadge: string;
  floatingBadgeSecondary: string;
  variant: LaptopVariant;
  /** Ảnh sản phẩm WebP/AVIF trong /public/banners (không chứa chữ); bỏ trống thì dùng LaptopMockup SVG. */
  image?: string;
}

export const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: "Bộ sưu tập Ultrabook 2026",
    title: "Mỏng nhẹ tinh tế,",
    highlight: "hiệu năng vượt bậc",
    desc: "Trọng lượng chỉ từ 1.2kg cùng thời lượng pin lên đến 18 giờ, sẵn sàng đồng hành suốt ngày dài làm việc và học tập.",
    ctaText: "Khám phá Ultrabook",
    ctaLink: "/products?target=MONG_NHE",
    secondaryText: "Tư vấn cấu hình",
    secondaryLink: "/advisor",
    floatingBadge: "Chỉ từ 1.24 kg",
    floatingBadgeSecondary: "Pin 18 tiếng",
    variant: "ultrabook",
    image: "/banners/hero-ultrabook.webp",
  },
  {
    id: 2,
    tag: "Gaming Thế hệ mới",
    title: "Chiến game đỉnh cao,",
    highlight: "thiết kế thanh lịch",
    desc: "Sức mạnh đồ họa RTX bứt phá, màn hình 165Hz QHD siêu mượt trong lớp vỏ trắng bạc sang trọng và tản nhiệt êm ái.",
    ctaText: "Xem dòng Gaming",
    ctaLink: "/products?target=GAMING",
    secondaryText: "So sánh máy",
    secondaryLink: "/compare",
    floatingBadge: "Màn hình 165Hz QHD",
    floatingBadgeSecondary: "Tản nhiệt buồng hơi",
    variant: "gaming",
    image: "/banners/hero-gaming.webp",
  },
  {
    id: 3,
    tag: "Đồ họa & Doanh nhân",
    title: "Sáng tạo không giới hạn,",
    highlight: "chuẩn màu đỉnh cao",
    desc: "Màn hình OLED 100% DCI-P3 chuẩn màu đồ họa chuyên nghiệp, tối ưu cho dựng video, đồ họa 3D và đa nhiệm chuyên sâu.",
    ctaText: "Xem máy Đồ họa",
    ctaLink: "/products?target=THIET_KE_DO_HOA",
    secondaryText: "Tư vấn cấu hình",
    secondaryLink: "/advisor",
    floatingBadge: "100% DCI-P3 Chuẩn màu",
    floatingBadgeSecondary: "Bảo hành 2 năm",
    variant: "creator",
    image: "/banners/hero-creator.webp",
  },
];

interface HeroSliderProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
}

export const HeroSlider: FC<HeroSliderProps> = ({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 5500,
}) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const goToSlide = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  // Autoplay loop
  useEffect(() => {
    if (isPaused || total <= 1) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, autoPlayInterval, nextSlide, total]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  const currentSlide = slides[current] ?? slides[0];

  return (
    <div
      className={styles.sliderWrap}
      role="region"
      aria-roledescription="carousel"
      aria-label="Khuyến mãi và máy tính nổi bật"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className={styles.sliderBox}>
        {/* Ambient Gradient Background */}
        <div className={styles.ambientBackground} aria-hidden />
        <div className={styles.ambientOrb} aria-hidden />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={styles.slideContent}
          >
            {/* Left Column: Copy & Actions */}
            <div className={styles.textCol}>
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowDot} aria-hidden />
                {currentSlide.tag}
              </span>

              <h1 className={styles.headline}>
                {currentSlide.title} <span className={styles.highlight}>{currentSlide.highlight}</span>
              </h1>

              <p className={styles.description}>{currentSlide.desc}</p>

              <div className={styles.actions}>
                <Link href={currentSlide.ctaLink} className={styles.primaryCta}>
                  <span>{currentSlide.ctaText}</span>
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>

                <Link href={currentSlide.secondaryLink} className={styles.secondaryCta}>
                  <span>{currentSlide.secondaryText}</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Mockup & Floating Badges */}
            <div className={styles.visualCol}>
              {/* Primary Floating Badge */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.35 }}
                className={styles.floatingBadgePrimary}
              >
                <span className={styles.badgeDot} aria-hidden />
                {currentSlide.floatingBadge}
              </motion.div>

              {/* Secondary Floating Badge */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.35 }}
                className={styles.floatingBadgeSecondary}
              >
                {currentSlide.floatingBadgeSecondary}
              </motion.div>

              {/* Laptop Floating Visual */}
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [-6, 6, -6] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={styles.laptopContainer}
              >
                {currentSlide.image ? (
                  <Image
                    src={currentSlide.image}
                    alt=""
                    width={880}
                    height={495}
                    priority={current === 0}
                    sizes="(min-width: 1024px) 440px, 90vw"
                    className={styles.laptopGraphic}
                  />
                ) : (
                  <LaptopMockup variant={currentSlide.variant} className={styles.laptopGraphic} />
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Previous Button */}
        <button
          type="button"
          onClick={prevSlide}
          className={`${styles.navBtn} ${styles.prevBtn}`}
          aria-label="Slide trước"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={nextSlide}
          className={`${styles.navBtn} ${styles.nextBtn}`}
          aria-label="Slide tiếp theo"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Indicators */}
        <div className={styles.indicatorList} role="tablist" aria-label="Các trang slide">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={idx === current}
              aria-label={`Chuyển tới slide ${idx + 1}: ${slide.tag}`}
              onClick={() => goToSlide(idx)}
              className={`${styles.indicator} ${idx === current ? styles.active : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
