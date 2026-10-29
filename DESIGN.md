---
version: alpha
name: LaptopShop Evergreen
description: Premium, trustworthy, green-first electronics commerce design system for a Next.js storefront and admin dashboard using SCSS Modules.
colors:
  primary: "#166534"
  primary-hover: "#14532D"
  primary-pressed: "#052E16"
  primary-soft: "#DCFCE7"
  on-primary: "#FFFFFF"
  secondary: "#475569"
  tertiary: "#B45309"
  background: "#F8FAF9"
  surface: "#FFFFFF"
  surface-muted: "#F1F5F2"
  surface-raised: "#FFFFFF"
  foreground: "#10251B"
  foreground-muted: "#475569"
  border: "#D9E4DC"
  border-strong: "#91AA99"
  border-input: "#7A9483"
  focus-ring: "#166534"
  link: "#166534"
  success: "#166534"
  success-soft: "#DCFCE7"
  warning: "#92400E"
  warning-soft: "#FEF3C7"
  error: "#B91C1C"
  error-soft: "#FEE2E2"
  info: "#1D4ED8"
  info-soft: "#DBEAFE"
  sale: "#B91C1C"
  disabled: "#E5E7EB"
  on-disabled: "#64748B"
  overlay: "rgba(9, 28, 16, 0.56)"
  glass-surface: "rgba(255, 255, 255, 0.82)"
  glass-border: "rgba(255, 255, 255, 0.65)"
  ambient-emerald: "rgba(22, 101, 52, 0.08)"
  ambient-teal: "rgba(13, 148, 136, 0.08)"
  ambient-sky: "rgba(2, 132, 199, 0.06)"
  dark-background: "#0B1711"
  dark-surface: "#122219"
  dark-foreground: "#F1F7F2"
  dark-border: "#294333"
  dark-primary: "#86EFAC"
  dark-on-primary: "#052E16"
typography:
  display:
    fontFamily: "Be Vietnam Pro"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: "Be Vietnam Pro"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.025em
  headline-md:
    fontFamily: "Be Vietnam Pro"
    fontSize: 28px
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: "Be Vietnam Pro"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.35
  title-lg:
    fontFamily: "Be Vietnam Pro"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
  title-md:
    fontFamily: "Be Vietnam Pro"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.45
  body-lg:
    fontFamily: "Be Vietnam Pro"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
  body-md:
    fontFamily: "Be Vietnam Pro"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Be Vietnam Pro"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: "Be Vietnam Pro"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
  label-sm:
    fontFamily: "Be Vietnam Pro"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.4
  price:
    fontFamily: "Be Vietnam Pro"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.02em
rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  zero: 0px
  one: 4px
  two: 8px
  three: 12px
  four: 16px
  five: 20px
  six: 24px
  eight: 32px
  ten: 40px
  twelve: 48px
  sixteen: 64px
  page-gutter-mobile: 16px
  page-gutter-tablet: 24px
  page-gutter-desktop: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: 44px
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    height: 44px
    padding: 12px
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    height: 44px
    padding: 12px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    height: 44px
    padding: 12px
  product-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 16px
  admin-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 24px
  badge-in-stock:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: 8px
  badge-sold-out:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
    rounded: "{rounded.full}"
    padding: 8px
  badge-pending:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
    padding: 8px
  modal:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: 24px
  page:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
---

## Overview

**Identity:** LaptopShop Evergreen is a modern Vietnamese laptop and electronics marketplace. It should feel technically precise, reliable, calm, and approachable—not like a gaming dashboard or a generic green-themed landing page.

**Audience:** people comparing laptops by performance, price, and use case; buyers completing checkout; employees administering catalog, inventory, customers, and orders.

**Product surfaces:** (1) customer storefront and checkout; (2) admin dashboard. Use the same core tokens, components, brand identity, and interaction conventions. Storefront should emphasize product photography, prices, clear comparisons, and purchase confidence. Admin should prioritize information density, scannability, filters, statuses, and safe destructive actions.

**Implementation:** Next.js App Router, TypeScript, **SCSS Modules**, global CSS custom properties, CSS Grid/Flexbox; optional Radix primitives for accessible interaction, Lucide for icons, and Motion for React only for complex transitions. **No Tailwind CSS, utility-first generated markup, CSS-in-JS dependency, or EJS.** Establish the design system before generating pages. The token names and literal values in YAML are the normative source of truth; prose clarifies usage.

**Default theme:** light. Dark mode is optional, requiring deliberate semantic token remapping and contrast testing; never invert colors automatically.

## Colors

Evergreen green is the **brand/action color**, not a blanket fill. Use deep forest green (`{colors.primary}`) for primary buttons, selected controls, high-priority interactive icons, and active navigation. Use `{colors.primary-hover}` and `{colors.primary-pressed}` only on appropriate interaction states. On-green text uses `{colors.on-primary}`.

- **Canvas / structure:** `{colors.background}` for the page, `{colors.surface}` for cards and panels, `{colors.surface-muted}` for subtle grouping. Borders rely on `{colors.border}`, not strong shadows everywhere.
- **Control boundaries:** text fields, selects, checkboxes, radios and switches use `{colors.border-input}` (3.29:1 on `{colors.surface}`) so their edges meet the 3:1 non-text contrast target. `{colors.border}` (1.31:1) is for decorative dividers and card outlines only; `{colors.border-strong}` is for hover emphasis on cards.
- **Typography:** `{colors.foreground}` for headings and essential values, `{colors.foreground-muted}` for descriptions and metadata.
- **Brand tint:** `{colors.primary-soft}` for light highlights, category backgrounds, and opt-in informational brand accents; never as the primary text color.
- **Commerce:** Show final prices in strong foreground, sale/discount information in `{colors.sale}` when genuinely applicable, and prior prices with muted strikethrough. A sale must not be represented only by color.
- **Semantics:** `{colors.success}` = successful or available; `{colors.warning}` = pending/needs attention; `{colors.error}` = failure/destructive/unavailable; `{colors.info}` = neutral informational state. Green must **not** indiscriminately mean every non-error status.
- **Focus:** visible keyboard focus using `{colors.focus-ring}`, with separation from adjacent surfaces. Hover is never the sole indicator of interactivity.
- **Dark mode:** opt-in semantic CSS override mapped to `dark-*` values; independently validate readable foreground, borders, dialogs, status chips, and input states.

**Contrast:** target WCAG AA: at least 4.5:1 for normal text and 3:1 for large text and essential non-text UI boundaries; verify actual rendered combinations. Never place muted gray text on pale green without checking contrast. Image overlays require a readable scrim.

## Typography

Use **Be Vietnam Pro** throughout customer and admin UIs for legible Vietnamese accents and consistent technical presentation. Bundle via `next/font/google` or a licensed self-hosted version; provide a `system-ui, sans-serif` fallback. Avoid more than two prominent font weights within a single component.

- Display/headlines: `{typography.display}`, `{typography.headline-lg}`, `{typography.headline-md}` for editorial banners, category headings, and page titles. Scale with `clamp()` on responsive pages rather than overflowing small screens.
- Responsive scale (YAML sizes are the maxima): display `clamp(32px, 4vw + 1rem, 48px)`, headline-lg `clamp(28px, 3vw + 1rem, 36px)`, headline-md `clamp(24px, 2vw + 1rem, 28px)`. Other roles keep fixed sizes.
- Weight note: Be Vietnam Pro ships static 400/600/700 only, so `headline-md` weight 650 renders as 600 in implementation.
- Card titles: `{typography.title-md}`; usually clamp to two lines without losing essential product identifiers.
- Body: `{typography.body-lg}` for description-rich pages, `{typography.body-md}` for standard UI, `{typography.body-sm}` for secondary metadata (not critical pricing or legal conditions).
- UI labels: `{typography.label-md}` and `{typography.label-sm}`; descriptive, sentence case, no unnecessary all-caps.
- Prices: `{typography.price}`; use `font-variant-numeric: tabular-nums` for totals, order lists, tables, and KPI numbers. Format prices as Vietnamese đồng with consistent locale and separators; the displayed currency is `₫`.
- Line length: prose 60–75 characters where practical; avoid dense multi-column paragraphs in checkout and product specifications.

## Layout

**Grid:** mobile-first CSS Grid/Flexbox. Center customer content in a maximum 1280px container with responsive gutters (`{spacing.page-gutter-mobile}`, `{spacing.page-gutter-tablet}`, `{spacing.page-gutter-desktop}`). Use a 12-column desktop design grid conceptually; implementation may use `repeat()` and `minmax()` rather than hardcoded column spans.

- **Breakpoints:** mobile `< 640px`; small tablet `640–767px`; tablet `768–1023px`; desktop `1024–1279px`; large desktop `>= 1280px`. These are application implementation conventions, not extra machine-readable schema keys.
- **Product listing:** 2 columns on standard mobile where cards remain readable; 3 on tablet, 4 on desktop; allow 1 column on narrow layouts/accessibility zoom. Filters become an accessible sheet/dialog on mobile, sidebar on desktop.
- **Product detail:** single column on mobile; image gallery and purchase information in separate desktop columns. Sticky buy bar on mobile must not cover content or bottom navigation.
- **Checkout:** sequential readable sections, clear order summary, transparent shipping and payment information; do not use crowded modal checkout.
- **Admin:** collapsible sidebar + header on desktop, compact navigation on mobile. Tables must retain critical fields, support horizontal scroll or purposeful card representations, and expose sort/filter/pagination clearly.
- **Rhythm:** 4px base scale, with 8/16/24/32px standard increments. Sections typically have 48–64px vertical separation on desktop, 32–40px on mobile. Keep consistent alignment across headings, filters, cards, and footers.
- **Responsive:** support 320px viewport, 200% zoom and long Vietnamese labels without clipping or horizontal page overflow.

## Elevation & Depth

Prefer borders and surface separation over heavy shadows. Use shadows sparingly:

- **Level 0:** flat base elements: `none`.
- **Level 1 (hover card):** `0 4px 14px rgba(16, 37, 27, 0.06)`.
- **Level 2 (popover/dropdown):** `0 12px 32px rgba(16, 37, 27, 0.12)`.
- **Level 3 (modal/drawer):** `0 24px 64px rgba(16, 37, 27, 0.18)` plus `{colors.overlay}` scrim.

Keep the z-index contract centralized in SCSS: content 0; sticky 10; dropdown 30; overlay 60; modal 70; toast 90. Do not use arbitrary `z-index: 99999`. Sticky headers must not obscure focused controls. Motion should never be necessary to understand content.

## Shapes

Use consistent, moderately soft geometry: 8px on fields and compact chips, 12px for buttons, 16px for cards, and 24px for major modals/drawers. Pill radius (`{rounded.full}`) is reserved for chips, indicators, and selected small controls—not every card. Prefer 1px semantic borders. Product photos should use a consistent 4:3 or 1:1 presentation with `object-fit: contain`; do not crop laptop bodies to fill arbitrary containers.

Icons should use a consistent stroke family (Lucide recommended), typically 18–20px for UI controls, and be paired with text when ambiguity exists. Maintain minimum 44×44px touch targets for primary mobile interactions.

## Components

Implement components as React components co-located with `*.module.scss`. Use semantic tags, CSS custom properties, and explicit variants; keep global SCSS reserved for reset, fonts, tokens, and base semantics.

### Buttons

- **Primary:** `{components.button-primary}`; deep green background with white text. The main conversion action (buy, continue checkout, save changes) should be unambiguous.
- **Secondary:** `{components.button-secondary}` with a 1px green/neutral border; use for add-to-cart, cancel, auxiliary actions. Style its hover background using a subtle brand tint rather than making it visually equal to primary.
- **Danger:** `{components.button-danger}` for confirmed destructive admin actions only; never style deletion in green.
- Sizes: small 36px, default 44px, large 48px. Disabled controls must be clearly inactive but provide explanatory context when necessary. Async requests show loading state and prevent accidental duplicate submission.

### Fields, Selects, and Search

Use `{components.input}`. Labels above fields, required marker plus contextual helper text, visible error text and icon, accessible `aria-describedby` when applicable. Focus gets a visible 2px focus treatment; do not remove browser focus styling without replacement. Search should debounce client queries when necessary but preserve keyboard submission. Price and quantity inputs must prevent invalid ranges through validation, not appearance alone.

### Product Cards

Use `{components.product-card}`. Hierarchy: image → brand/model title → one or two decisive specs → current price → availability → action. Keep equal-height card alignment; reserve image space to prevent layout shifts. Show sale badge only when backed by price data, and never fabricate ratings, scarcity, discounts, or reviews. The primary buy action must remain accessible on touch screens without hover.

### Product Detail & Comparison

Present manufacturer, CPU, GPU, RAM, storage, display, warranty, stock, and delivery information only when available in product data. Separate short highlights from full specifications. Comparison tables should align values and surface differences without relying exclusively on red/green coloring. Image gallery thumbnails must be keyboard selectable and provide descriptive alt text.

### Shopping Cart & Checkout

Quantity stepper, remove action, and totals must provide prompt feedback and understandable error states. Do not suggest that a successful UI transition proves payment/order success before API confirmation. Use a clear order summary and a distinct final confirmation button. Preserve entered form values after recoverable errors; avoid manipulative urgency patterns.

### Navigation & Mobile

Header includes brand, search, categories, cart and account. Desktop navigation should remain concise. On mobile, use one obvious menu/filter entry point and avoid stacking multiple sticky bars. Navigation must work via keyboard, pointer, and touch.

### Admin Dashboard

Use `{components.admin-card}` for KPIs and structured panels. KPI numerals employ tabular figures; trends include readable labels and time windows. Dense tables have stable column alignments, skeleton loading, honest empty states, filters, pagination, and individually scoped action menus. Status badges consistently use semantic colors; don't confuse order status with payment status.

### Dialogs, Toasts & Feedback

Use `{components.modal}` for destructive confirmations and focused tasks; trap focus, restore it upon close, support Escape when safe, and respect screen reader semantics. Toasts are concise, never the sole persistent presentation of critical errors. Skeletons preserve the expected layout dimensions.

### Animation & Interaction

Transitions: 120–180ms for color/hover/focus, 180–240ms for menus, 240–320ms for dialogs; use `ease-out` for entry and `ease-in` for exit. Prefer opacity/transform over animating layout-heavy properties. Limit hover movement to 2–4px. Honor `prefers-reduced-motion: reduce` and disable non-essential movement. Do not autoplay decorative carousels by default.

### Design Tokens in CSS / SCSS

Map YAML tokens into CSS custom properties (`--color-primary`, `--color-surface`, `--radius-md`, etc.) maintained in `src/styles/_tokens.scss` or an equivalent single source. Keep component CSS values token-based; do not duplicate random hex colors across modules. SCSS mixins may encode responsive breakpoints, while runtime theming uses CSS variables. The reference in YAML, e.g. `{colors.primary}`, is **DESIGN.md syntax**, not a literal value to paste into CSS.

Recommended component structure:

```text
src/
  styles/_tokens.scss
  styles/_mixins.scss
  styles/globals.scss
  components/ui/Button/Button.tsx
  components/ui/Button/Button.module.scss
  features/products/components/ProductCard/ProductCard.tsx
  features/products/components/ProductCard/ProductCard.module.scss
```

## Content & Terminology

All customer and admin UI copy is Vietnamese. Never render an API enum key (for example `SINHVIEN_VANPHONG`, `APPROVED`, `RESOLVED`) to users; map every enum through a label table, and show a neutral fallback ("Không xác định") for unknown values. Service promises (warranty length, free shipping, exchange windows, hotline, invoices) appear only when they come from a confirmed business source or backend data; never hardcode them in marketing copy.

| Avoid | Use |
| --- | --- |
| Wishlist | Yêu thích |
| In-App | Trong ứng dụng |
| Web Push | Thông báo trình duyệt |
| Price Alert | Cảnh báo giá |
| Notification Operations | Vận hành thông báo |
| Choose File | Chọn ảnh / Chọn tệp |
| Review reason | Lý do cần xem xét |

## Do's and Don'ts

**Do**

- Read this entire file before creating or restyling a page; prefer existing components and CSS tokens.
- Keep deep forest green as the recognizable brand color; use whitespace, typography, and photography to provide the premium feel.
- Test layouts at 320, 375, 768, 1024, 1280 and 1440px, plus keyboard navigation and 200% zoom.
- Keep product data, specifications, prices, discounts, and availability truthful and sourced from the backend.
- Meet WCAG AA contrast, visible focus, appropriate landmarks, form labels, descriptive alt text, and reduced-motion requirements.
- Use semantic class names and local SCSS Modules; audit visual consistency across storefront and admin.
- Apply consistent loading, empty, error, disabled and success states to every significant screen.

**Don't**

- Don't use Tailwind CSS, unscoped component styles, CSS-in-JS, or inline style objects to replace the design system.
- Don't use bright neon green, saturated green gradients, green background blocks everywhere, excessive blur/glassmorphism, or oversized rounded pills.
- Don't mix unrelated typography families, wildly varying radii, or inconsistent shadows.
- Don't make essential functionality hover-only or color-only.
- Don't invent product ratings, crossed-out prices, fake discount percentages, fake urgency or unsupported social proof.
- Don't place purchase totals, pricing validation or authorization decisions solely in frontend code.
- Don't change YAML token values silently: update the corresponding CSS mapping, regression snapshots, and relevant design references.

**Agent acceptance criteria:** Generated UI follows this DESIGN.md; uses Next.js + TypeScript + SCSS Modules without Tailwind; passes responsive, keyboard, accessibility and color consistency review; matches storefront and admin interaction patterns; and contains no invented business data.
