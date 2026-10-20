# 《在播放键出现之前》Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an accessible garden essay that lets readers compare Scott’s 9 April 1860 phonautogram with First Sounds’ reconstructed audio while making the reconstruction and reuse rights explicit.

**Architecture:** Use one new MDX entry and a small scoped presentation class in the existing global stylesheet. Host the specifically matching trace locally only if the image’s reuse permission is verified; serve an unchanged local copy of First Sounds’ CC BY reconstruction to avoid cross-origin media failures. Keep native controls with no preload. Extend the existing Playwright route/accessibility smoke coverage.

**Tech Stack:** Astro 7, MDX content collection, CSS, Playwright.

---

## File structure

- Create `src/content/garden/before-the-play-button.mdx` for the article, source links, figure, and native audio control.
- Create `public/images/archive/scott-1860-no-5-detail.png` only from a trace image whose specific reuse permission is confirmed; preserve its pixels and record its source and license in the figure caption and article sources.
- Create `public/audio/scott-feaster-no-36.mp3` as an unchanged local copy of First Sounds’ CC BY reconstruction and attribute/link the original source.
- Modify `src/styles/global.css` with only the responsive, two-column media presentation and its mobile stack.
- Modify `tests/site.spec.ts` to include the new route and verify the image alternative text, native controls, no autoplay/preload, and no horizontal overflow at 360px.

## Task 1: Verify the exact trace and its reuse terms

- [x] Confirm the First Sounds Scott page identifies phonautogram No. 5 as the 9 April 1860 “Au Clair de la Lune” record and that the selected playback is the May 2010 release.
- [x] Confirm First Sounds’ reuse page covers the audio and record exact attribution/change requirements.
- [x] Inspect the exact No. 5 trace image published in the First Sounds research record. The First Sounds rights page applies CC BY to its work unless otherwise indicated; this figure credits the Académie des Sciences as the source collection and has no separate restriction notice.
- [x] Save the unchanged figure from the research PDF at `public/images/archive/scott-1860-no-5-detail.png`; do not crop, recolor, or otherwise alter it. Attribute First Sounds, the Académie des Sciences, and the CC BY terms immediately in the caption.

## Task 2: Add the source-backed article

- [x] Create `src/content/garden/before-the-play-button.mdx` with `kind: encounter`, date `2026-10-20`, tags for sound archives/media restoration, and `related: [what-counts-as-experience]`.
- [x] Explain that the phonautograph made visual traces for study, not intended playback; distinguish the physical trace, a digital scan, and a later audio reconstruction.
- [x] State that First Sounds’ first playback and later versions differed; describe the virtual-stylus and variable-width approaches only to the level supported by its method page, and identify the displayed file as the May 2010 version.
- [x] Include the authorized trace in a semantic `figure` with meaningful `alt` and an attribution `figcaption`.
- [x] Include the audio as `<audio controls preload="none">` with descriptive text and a link to the source page. No autoplay, JavaScript, or analytics are used.
- [x] Add source entries for the Library of Congress overview, First Sounds’ Scott page, playback-method page, and reuse terms page.
- [x] Write the conclusion as a limited observation about the interpretation steps between trace and sound; explicitly state this is an internet encounter, not bodily or archival experience.

## Task 3: Style the media comparison

- [x] Add a focused `.phonautogram-listening` rule in `src/styles/global.css` to place the image and audio in two balanced columns on wide screens.
- [x] At the existing 780px breakpoint, stack media blocks and keep the image within the viewport.
- [x] Ensure the figure caption and audio label remain visible, and controls remain browser-native and keyboard-operable.

## Task 4: Verify the article and publish checks

- [x] Add `/garden/before-the-play-button/` to the public-route test array.
- [x] Add a Playwright test that asserts the figure has meaningful alternative text, the audio has native controls with `preload="none"` and no `autoplay`, and the page has no horizontal overflow at 360px.
- [x] Run the focused route test with `npm run test:e2e -- --grep "phonautogram"` and confirm it passes after building the current site.
- [x] Run `npm run verify:publish`; privacy scan, Astro checks, production build, and all 12 E2E tests pass.
- [x] Inspect `git diff --check`; commit using the repository’s Orange identity.
- [ ] Push `main`; verify the published article, image, audio response, RSS item, and sitemap entry after Cloudflare Pages deploys.

## Self-review

- The approved spec’s content, source traceability, author boundary, responsive presentation, accessibility, no-autoplay/no-analytics behavior, privacy scan, full publish verification, and online follow-up each map to a task above.
- Image rights are an explicit gate; an unverified scan cannot silently be substituted with a different date or object.
- `preload="none"` avoids fetching the audio before a visitor chooses to listen, while native controls retain keyboard access.
