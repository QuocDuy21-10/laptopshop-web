import type { FC, SVGProps } from "react";

export type LaptopVariant = "ultrabook" | "gaming" | "creator";

interface LaptopMockupProps extends SVGProps<SVGSVGElement> {
  variant?: LaptopVariant;
  className?: string;
}

export const LaptopMockup: FC<LaptopMockupProps> = ({
  variant = "ultrabook",
  className,
  ...props
}) => {
  if (variant === "gaming") {
    // Gaming White/Silver Edition: sleek white/lunar chassis with ice-blue accents
    return (
      <svg
        viewBox="0 0 520 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <defs>
          <linearGradient id="gamingLidGrad" x1="260" y1="20" x2="260" y2="230" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F8FAFC" />
            <stop offset="1" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="gamingScreenGrad" x1="80" y1="36" x2="440" y2="216" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F172A" />
            <stop offset="0.5" stopColor="#0284C7" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="gamingBaseGrad" x1="260" y1="230" x2="260" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#CBD5E1" />
          </linearGradient>
          <linearGradient id="gamingRgbGrad" x1="160" y1="248" x2="360" y2="248" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.5" stopColor="#34D399" />
            <stop offset="1" stopColor="#818CF8" />
          </linearGradient>
          <filter id="gamingGlow" x="0" y="0" width="520" height="340" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shadow */}
        <ellipse cx="260" cy="305" rx="210" ry="18" fill="rgba(15, 23, 42, 0.12)" />

        {/* Screen Bezel & Lid */}
        <rect x="70" y="24" width="380" height="210" rx="14" fill="url(#gamingLidGrad)" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="82" y="36" width="356" height="186" rx="6" fill="#0A0F1D" />

        {/* Screen Display (Cyber Game / High Refresh Visual) */}
        <rect x="84" y="38" width="352" height="182" rx="4" fill="url(#gamingScreenGrad)" />
        <circle cx="260" cy="120" r="44" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" strokeDasharray="6 6" />
        <circle cx="260" cy="120" r="28" fill="rgba(255, 255, 255, 0.2)" />
        <path d="M260 76 V164 M216 120 H304" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.5" />
        <rect x="100" y="52" width="60" height="18" rx="4" fill="rgba(0, 0, 0, 0.4)" />
        <text x="130" y="65" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
          165Hz QHD
        </text>

        {/* Camera notch */}
        <circle cx="260" cy="30" r="2.5" fill="#475569" />

        {/* Hinge */}
        <rect x="180" y="230" width="160" height="8" rx="3" fill="#94A3B8" />

        {/* Keyboard Base */}
        <polygon points="30,290 70,234 450,234 490,290" fill="url(#gamingBaseGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
        
        {/* RGB Keyboard deck glow */}
        <polygon points="100,270 125,242 395,242 420,270" fill="#1E293B" stroke="url(#gamingRgbGrad)" strokeWidth="1.5" />
        <rect x="140" y="246" width="240" height="20" rx="3" fill="url(#gamingRgbGrad)" opacity="0.4" />

        {/* Touchpad */}
        <rect x="220" y="274" width="80" height="14" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />

        {/* Front lip / chamfer */}
        <rect x="30" y="290" width="460" height="6" rx="2" fill="#94A3B8" />
      </svg>
    );
  }

  if (variant === "creator") {
    // Creator / Pro Laptop: Metallic graphite, color-calibrated display with vivid creative workspace
    return (
      <svg
        viewBox="0 0 520 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <defs>
          <linearGradient id="creatorLidGrad" x1="260" y1="20" x2="260" y2="230" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F1F5F9" />
            <stop offset="1" stopColor="#CBD5E1" />
          </linearGradient>
          <linearGradient id="creatorScreenGrad" x1="80" y1="36" x2="440" y2="216" gradientUnits="userSpaceOnUse">
            <stop stopColor="#047857" />
            <stop offset="0.5" stopColor="#0F766E" />
            <stop offset="1" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="creatorBaseGrad" x1="260" y1="230" x2="260" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F8FAFC" />
            <stop offset="1" stopColor="#94A3B8" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="260" cy="305" rx="210" ry="18" fill="rgba(15, 23, 42, 0.12)" />

        {/* Screen Lid */}
        <rect x="70" y="24" width="380" height="210" rx="14" fill="url(#creatorLidGrad)" stroke="#94A3B8" strokeWidth="1.5" />
        <rect x="82" y="36" width="356" height="186" rx="6" fill="#020617" />

        {/* Screen Display (Vivid Creative Spectrum) */}
        <rect x="84" y="38" width="352" height="182" rx="4" fill="url(#creatorScreenGrad)" />

        {/* Graphic elements on screen */}
        <path d="M120 180 C 180 100, 280 200, 340 110 C 370 70, 410 130, 436 150 L 436 220 L 84 220 Z" fill="rgba(255, 255, 255, 0.15)" />
        <circle cx="210" cy="90" r="24" fill="rgba(251, 191, 36, 0.8)" />
        <rect x="100" y="52" width="70" height="18" rx="4" fill="rgba(0, 0, 0, 0.45)" />
        <text x="135" y="65" fill="#34D399" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
          100% DCI-P3
        </text>

        {/* Camera */}
        <circle cx="260" cy="30" r="2.5" fill="#334155" />

        {/* Hinge */}
        <rect x="190" y="230" width="140" height="8" rx="2" fill="#64748B" />

        {/* Keyboard Base */}
        <polygon points="35,288 72,234 448,234 485,288" fill="url(#creatorBaseGrad)" stroke="#CBD5E1" strokeWidth="1.5" />

        {/* Keyboard deck */}
        <polygon points="105,268 128,242 392,242 415,268" fill="#1E293B" />
        <rect x="140" y="246" width="240" height="18" rx="2" fill="#334155" />

        {/* Large glass Touchpad */}
        <rect x="210" y="272" width="100" height="15" rx="3" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />

        {/* Front edge */}
        <rect x="35" y="288" width="450" height="6" rx="2" fill="#64748B" />
      </svg>
    );
  }

  // Default: Ultrabook (MacBook Air / XPS style sleek silver)
  return (
    <svg
      viewBox="0 0 520 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="ultraLidGrad" x1="260" y1="20" x2="260" y2="230" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="ultraScreenGrad" x1="84" y1="38" x2="436" y2="220" gradientUnits="userSpaceOnUse">
          <stop stopColor="#059669" />
          <stop offset="0.6" stopColor="#0D9488" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="ultraBaseGrad" x1="260" y1="230" x2="260" y2="296" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FAFC" />
          <stop offset="1" stopColor="#CBD5E1" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="260" cy="305" rx="210" ry="18" fill="rgba(15, 23, 42, 0.12)" />

      {/* Screen Lid */}
      <rect x="74" y="26" width="372" height="208" rx="14" fill="url(#ultraLidGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
      <rect x="84" y="38" width="352" height="184" rx="6" fill="#0F172A" />

      {/* Display (Clean Emerald Bloom) */}
      <rect x="86" y="40" width="348" height="180" rx="4" fill="url(#ultraScreenGrad)" />

      {/* Smooth Bloom Curves */}
      <path
        d="M86 160 C 180 80, 260 210, 434 100 L 434 220 L 86 220 Z"
        fill="rgba(255, 255, 255, 0.2)"
      />
      <circle cx="260" cy="115" r="32" fill="rgba(255, 255, 255, 0.25)" />

      <rect x="100" y="52" width="64" height="18" rx="4" fill="rgba(0, 0, 0, 0.35)" />
      <text x="132" y="65" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
        18h BATTERY
      </text>

      {/* Camera */}
      <circle cx="260" cy="32" r="2.5" fill="#475569" />

      {/* Hinge */}
      <rect x="195" y="230" width="130" height="6" rx="2" fill="#94A3B8" />

      {/* Keyboard Base */}
      <polygon points="40,286 76,234 444,234 480,286" fill="url(#ultraBaseGrad)" stroke="#CBD5E1" strokeWidth="1.5" />

      {/* Keyboard deck */}
      <polygon points="110,266 132,242 388,242 410,266" fill="#0F172A" />
      <rect x="144" y="246" width="232" height="16" rx="2" fill="#334155" />

      {/* Touchpad */}
      <rect x="216" y="270" width="88" height="14" rx="2" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />

      {/* Notch at front */}
      <rect x="240" y="286" width="40" height="2" rx="1" fill="#94A3B8" />
      <rect x="40" y="286" width="440" height="5" rx="2" fill="#94A3B8" />
    </svg>
  );
};
