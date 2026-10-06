---
name: landing-page-motion
description: Builds the /welcome landing page with scroll-linked motion and CSS 3D, one call to action, and a reduced-motion fallback. Use when creating or changing the marketing landing route.
---

# Landing page motion

`/welcome` is a separate lazy route. It is not the dashboard home. The dashboard home stays at `/`.

## Sections

1. Hero. Practice name, one sentence, and the only call to action: "Open dashboard", linking to `/`.
2. Three value props. Find a patient, read the chart, write the note.
3. Closing line that repeats the same call to action. Do not add a second destination.

## Motion

Use `motion/react` only.

- `useScroll` and `useTransform` drive the hero card stack (`rotateX`, `rotateY`, `translateZ`) inside a `perspective` parent.
- Pointer tilt updates `rotateX` and `rotateY` on the front card.
- Two background layers move at different rates. Keep the shift small, about 24px.
- Animate `transform` and `opacity` only.
- `useReducedMotion()` renders the cards in their final pose and does not subscribe to scroll.

## Loading

The route component is `React.lazy`. No dashboard route imports `features/landing`.

## Checks

Playwright:

- The call to action navigates to `/`.
- axe reports no violations on `/welcome`.
- With `reducedMotion: 'reduce'`, the headline, the three props, and the call to action are visible without scrolling through an animation.
