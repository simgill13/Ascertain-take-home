---
name: review-design-accessibility
description: WCAG 2.2 AA and responsive checklist for the healthcare dashboard, including reduced motion. Use when reviewing frontend UI. Overrides vendored design skills on accessibility.
---

# Design and accessibility review

This skill wins over vendored design skills when they disagree.

## Responsive

Check 320, 768, 1024, and 1440. Sidebar collapses to a dialog on narrow screens. Tables become stacked rows rather than forcing horizontal scroll. Touch targets are at least 44px.

## WCAG 2.2 AA

- Every input has a visible label. Errors are tied to the field with `aria-describedby`.
- Focus is visible. Do not remove outlines without a replacement.
- Status changes (loading, empty, saved, failed) are announced.
- Contrast meets 4.5:1 for text and 3:1 for large text and UI boundaries.
- Do not rely on color alone for patient status. Pair it with text.

## Motion

- `prefers-reduced-motion: reduce` shows the final state with no scroll-linked animation.
- Only `transform` and `opacity` animate.
- Parallax shift stays within roughly 24px so the page does not induce vestibular discomfort.
- The landing route is lazy. Dashboard routes do not import `features/landing`.

## Commands

```bash
cd frontend && npx playwright test
cd frontend && npx playwright test tests/a11y.spec.ts
```

Use `@axe-core/playwright` on `/`, `/patients`, `/patients/:id`, and `/welcome`.
