# 不同步实验 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a small, privacy-preserving interactive page where immediate and delayed motion make change visible through their separation.

**Architecture:** Add a static Astro route at `/lag/` with one inline client script. The script tracks pointer or touch position, moves a foreground dot immediately and a second dot with exponential easing, and exposes the current separation as a visual gap only. No analytics, storage, network requests, or recommendation logic.

**Tech Stack:** Astro, TypeScript, CSS, Playwright.

---

### Task 1: Add the experiment page

**Files:**
- Create: `src/pages/lag.astro`
- Modify: `tests/site.spec.ts`

- [ ] Add the page copy, reduced-motion behavior, keyboard fallback, and pointer/touch interaction in `src/pages/lag.astro`.
- [ ] Add the route to the public route smoke test and verify that the two markers render without horizontal overflow.
- [ ] Run `npm run verify:publish` and inspect the page at desktop and 360px widths.
- [ ] Commit with `feat: add lag experiment`.

### Task 2: Add navigation entry

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`

- [ ] Link the experiment from the existing works area and footer using the label “不同步实验”.
- [ ] Keep the page static and avoid adding it to the random trail data until it has been tested in use.
- [ ] Run the full publish verification and confirm sitemap/RSS behavior remains unchanged.
- [ ] Commit with `feat: link lag experiment`.
