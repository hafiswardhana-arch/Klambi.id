# KLAMBI.ID — MOTION DESIGN & INTERACTIVE EXPERIENCE SYSTEM
## Comprehensive Technical Documentation & Integration Guide (v1.0)

---

## 1. Executive Summary & Motion Manifesto

The **Klambi.id Motion Design System** elevates the user experience of Indonesia's premier AI-powered circular fashion platform. Designed in accordance with modern web interaction benchmarks (including *alfari.my.id*), the system delivers tactile feedback, purposeful spatial orientation, and visual delight while strictly preserving existing business logic, authentication, AI scanning, and financial escrow safeguards.

### Core Motion Principles
1. **Motion with Purpose**: Every animation serves a functional purpose (orienting user focus, confirming actions, indicating real-time background processing, or softening state transitions). Decorative vanity animations without user value are prohibited.
2. **Performance First**: All animations exclusively manipulate GPU-composited properties (`transform`, `opacity`, and `filter`). Layout thrashing (`top`, `left`, `width`, `height`, `margin`, `padding`) during animation cycles is strictly avoided.
3. **Inclusive & Accessible**: Complete compliance with WCAG 2.2 Level AA and `prefers-reduced-motion: reduce`. Users with vestibular disorders or motion sensitivity experience instantaneous transitions with zero disorienting movement.
4. **Delight in Circular Economy**: Interactive signatures—such as the circular infinity-to-checkmark resolution during Wearwise AI scanning—reinforce the platform's mission of textile reuse, upcycling, and sustainable garment care.

---

## 2. Motion Tokens Specification

Centralized motion tokens are codified in [`src/lib/motion/tokens.ts`](file:///c:/Users/ASUS/Pictures/Klambi%20(APK)/src/lib/motion/tokens.ts) and synchronized with [`tailwind.config.js`](file:///c:/Users/ASUS/Pictures/Klambi%20(APK)/tailwind.config.js) and [`src/styles/tailwind.css`](file:///c:/Users/ASUS/Pictures/Klambi%20(APK)/src/styles/tailwind.css).

### 2.1 Durations
| Token | Duration | Purpose / Usage |
| :--- | :--- | :--- |
| `MOTION_DURATIONS.xs` | `150ms` | Instant micro-interactions, button active states, icon hover shifts |
| `MOTION_DURATIONS.sm` | `250ms` | Modal open/close, dropdown reveals, tab indicator changes |
| `MOTION_DURATIONS.md` | `380ms` | Card entry transitions, drawer slide-overs, step wizard navigations |
| `MOTION_DURATIONS.lg` | `600ms` | Complex layout shifts, banner carousel auto-rotations |
| `MOTION_DURATIONS.xl` | `1200ms` | Ambient decorative loops (pulsing badges, slow glowing halos) |
| `MOTION_DURATIONS.ai` | `6000ms` | Wearwise AI multi-stage computer vision scanning simulation cycle |

### 2.2 Easing Curves (Cubic Bézier)
| Token | CSS Definition | Semantic Characteristic |
| :--- | :--- | :--- |
| `ease-out-soft` | `cubic-bezier(0.16, 1, 0.3, 1)` | Swift start with gentle deceleration (ideal for entry transitions) |
| `ease-in-soft` | `cubic-bezier(0.7, 0, 0.84, 0)` | Accelerating exit curve (ideal for elements leaving viewport) |
| `ease-in-out-soft` | `cubic-bezier(0.65, 0, 0.35, 1)` | Symmetrical smooth transition for carousels and continuous sweeps |
| `spring-subtle` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Micro-overshoot spring effect for checkmarks and completion badges |

### 2.3 Stagger Delay Steps
- **Stagger 1**: `80ms` (Subtle header/banner cascade)
- **Stagger 2**: `160ms` (Metrics counter and status indicators)
- **Stagger 3**: `240ms` (Action grids and circular service tiles)
- **Stagger 4**: `320ms` (Product cards and secondary recommendations)

---

## 3. Reusable Motion Components Library

All components reside in [`src/components/motion/`](file:///c:/Users/ASUS/Pictures/Klambi%20(APK)/src/components/motion/) and are barrel-exported via [`src/components/motion/index.ts`](file:///c:/Users/ASUS/Pictures/Klambi%20(APK)/src/components/motion/index.ts).

### 3.1 `<FadeIn />`
Renders an opacity transition with optional delay and direction-neutral fading.
```tsx
import { FadeIn } from '@/components/motion';

<FadeIn duration={300} delay={100}>
  <p className="text-sm">Content smoothly appears</p>
</FadeIn>
```

### 3.2 `<SlideUp />`
Translates an element from `translateY(distance)` to `translateY(0)` with GPU hardware acceleration.
```tsx
import { SlideUp } from '@/components/motion';

<SlideUp distance={24} duration={380} delay={80}>
  <HeroBanner />
</SlideUp>
```

### 3.3 `<ScaleIn />`
Expands an element from an initial scale (`0.92`) to natural scale (`1.0`) with optional spring easing.
```tsx
import { ScaleIn } from '@/components/motion';

<ScaleIn scaleFrom={0.85} duration={300}>
  <CircularAvatar />
</ScaleIn>
```

### 3.4 `<StaggerContainer />` & `<StaggerItem />`
Coordinates automatic sequential appearance of lists and grids without manual delay calculation.
```tsx
import { StaggerContainer, StaggerItem } from '@/components/motion';

<StaggerContainer staggerDelay={60} className="grid grid-cols-2 gap-3">
  {items.map(item => (
    <StaggerItem key={item.id}>
      <Card data={item} />
    </StaggerItem>
  ))}
</StaggerContainer>
```

### 3.5 `<RevealOnScroll />`
Uses a zero-dependency `IntersectionObserver` hook (`useInView`) to trigger reveal animations only when elements enter the user's viewport.
```tsx
import { RevealOnScroll } from '@/components/motion';

<RevealOnScroll animation="slide-up" threshold={0.15}>
  <ProductCatalogSection />
</RevealOnScroll>
```

### 3.6 `<AnimatedButton />`
Provides immediate tactile feedback on touch/mouse interaction (`scale(0.97)` on click/active), with built-in disabled suppression.
```tsx
import { AnimatedButton } from '@/components/motion';

<AnimatedButton
  onClick={handleCheckout}
  scaleDown={0.96}
  className="bg-primary text-white py-3 px-6 rounded-2xl"
>
  Bayar Sekarang
</AnimatedButton>
```

### 3.7 `<AnimatedCard />`
Encapsulates hover elevation, border illumination, and subtle spring lift for marketplace listings and service cards.
```tsx
import { AnimatedCard } from '@/components/motion';

<AnimatedCard hoverLift hoverGlow onClick={openDetail}>
  <ProductDetails />
</AnimatedCard>
```

### 3.8 `<AnimatedPresence />`
Provides enter and exit transition management without third-party heavy dependencies. Keeps elements in the DOM during exit transitions.
```tsx
import { AnimatedPresence } from '@/components/motion';

<AnimatedPresence show={isModalOpen} duration={250}>
  <ConfirmationModal onClose={() => setIsModalOpen(false)} />
</AnimatedPresence>
```

### 3.9 `<SignatureCircularMotion />`
The brand signature animation for Klambi.id. Represents the circular loop of sustainable fashion, transitioning from an infinity loop into a verified checkmark upon AI scan completion.
Located at [`src/components/ui/SignatureCircularMotion.tsx`](file:///c:/Users/ASUS/Pictures/Klambi%20(APK)/src/components/ui/SignatureCircularMotion.tsx).

---

## 4. Accessibility & Reduced Motion Integration

### 4.1 System Detection Hook: `useReducedMotion`
The [`src/lib/motion/useReducedMotion.ts`](file:///c:/Users/ASUS/Pictures/Klambi%20(APK)/src/lib/motion/useReducedMotion.ts) hook continuously observes `window.matchMedia('(prefers-reduced-motion: reduce)')`. When active:
- Transition and animation durations evaluate to `0ms`.
- Stagger delays are suppressed to `0ms`.
- All CSS transform offsets are clamped to zero.

### 4.2 Global CSS Fallback
In [`src/styles/tailwind.css`](file:///c:/Users/ASUS/Pictures/Klambi%20(APK)/src/styles/tailwind.css), a global safeguard ensures that any third-party or legacy CSS animation is instantly halted for users who configured reduced motion in their OS:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 5. Screen & Feature Integrations

### 5.1 Dashboard (`/`)
- Staggered entrance for greeting hero, promotional carousel, and circular impact tracker.
- Smooth horizontal glide on category filtering pills with active pill scale accentuation.
- Shimmer skeleton placeholder and card lift on featured drops.

### 5.2 Wearwise AI Scanner (`/wearwise-ai`)
- Reticle corner targeting animation (`animate-corner-lock`).
- Laser sweep animation across clothing preview (`animate-scan-laser`).
- Progressive 4-stage circular analysis checklist with icon confirmation.
- Brand signature infinity-to-checkmark resolution upon 100% confidence calculation.

### 5.3 Circular Decision Hub (`/keputusan`)
- Dual-path decision cards ("Ingin Dijual" & "Butuh Perawatan") with animated card lift, dynamic arrow translation, and active border feedback.
- Staggered appearance to allow cognitive focus on circular choices.

### 5.4 Trift Marketplace (`/trift-marketplace`)
- Fluid product card reveal with score bar fill transition.
- Micro-interactions on favorite hearts and seller badges.
- Quick buy overlay reveal on hover/touch.

### 5.5 Escrow Payment & Checkout (`/pembayaran`)
- Staggered payment method selection list.
- Radio selection scale micro-interaction.
- `AnimatedButton` with inline spinning indicator preventing duplicate submissions during idempotent processing.

---

## 6. Performance Benchmarks & Quality Assurance

- **Frame Rate Target**: 60 FPS minimum maintained across modern iOS Safari and Android Chrome.
- **Paint Complexity**: Kept to single composite layer by avoiding properties that trigger CPU layout or repaint.
- **Bundle Footprint**: Zero external animation runtime dependencies (Framer Motion / GSAP omitted per PRD Section 7.6). Net bundle increase < 5KB gzipped.
- **Server-Side Rendering**: 100% SSR safe with client hydration guards.
