# 《岔路》分类视觉 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为《岔路》的随机入口卡片补充六类本站自托管视觉，并保证图片失败时文字入口仍可使用。

**Architecture:** 一次生成统一风格的 3×2 六宫格母图，裁成六张 WebP。客户端脚本按入口分类选择固定图片并生成语义为装饰的 `<img>`；现有随机选择、历史记录和隐私行为保持不变。

**Tech Stack:** Astro 7、TypeScript、CSS、WebP、Playwright、ImageGen、ffmpeg

---

### Task 1: 生成并准备六类视觉资产

**Files:**
- Create: `public/images/trails/digital-archive.webp`
- Create: `public/images/trails/museum.webp`
- Create: `public/images/trails/longform.webp`
- Create: `public/images/trails/maps.webp`
- Create: `public/images/trails/interactive.webp`
- Create: `public/images/trails/code.webp`

- [ ] **Step 1: 使用 ImageGen 生成统一六宫格母图**

Prompt:

```text
Create one exact 3-column by 2-row contact sheet made of six equal square abstract editorial artworks. No gaps, no borders, no labels, no letters, no numbers, no logos, no people, and no recognizable institution or website. Each tile must remain visually distinct while sharing one restrained visual system inspired by a rain-washed city, electronic maps, archival scans, and quiet technical diagrams. Palette: mist blue-gray #DCE5E5, asphalt black #1D2426, signal orange #F05A28 used sparingly, moss green #526A60, cold white #F7F8F5, old-map blue #617C93. Matte paper grain, subtle scan artifacts, crisp geometric details, calm rather than futuristic.

Tile order, left to right:
Top left — digital archive: scanner light, torn paper edges, microfilm frames, index grids.
Top center — museum: specimen drawers, glass edges, object silhouettes, faint catalog marks.
Top right — longform reading: layered pages, marginal notes suggested without legible writing, a narrow reading-light beam.
Bottom left — maps: contour lines, worn folds, coordinate grid, an unfinished route.
Bottom center — interactive work: nodes, paths, input feedback, one signal drifting away from the center.
Bottom right — code experiment: pixel grid, shader-like noise, geometric field, one small orange pulse that appears active.

Perfect orthographic flat composition. Every tile must fill its cell edge to edge and be safe to crop exactly into six squares.
```

Expected: one landscape image with a clean 3×2 arrangement and no visible text or cell dividers.

- [ ] **Step 2: Inspect the generated mother image**

Use `view_image` at original detail. Reject and regenerate once if the grid order is wrong, text appears, panels are not separable, or the palette materially diverges.

- [ ] **Step 3: Crop and compress the six cells**

Use ffmpeg crop expressions based on the actual mother-image dimensions. Map cells in this order:

```text
(0,0) digital-archive.webp
(1,0) museum.webp
(2,0) longform.webp
(0,1) maps.webp
(1,1) interactive.webp
(2,1) code.webp
```

Each output must be WebP, square, at least 480×480, and under 250 KB.

### Task 2: Render the category image on every trail card

**Files:**
- Modify: `src/scripts/trails.ts`
- Modify: `src/pages/path.astro`

- [ ] **Step 1: Add the category-to-image mapping and card markup**

Add this mapping after `HISTORY_LIMIT`:

```ts
const TRAIL_VISUALS: Record<string, string> = {
	数字档案: '/images/trails/digital-archive.webp',
	博物馆: '/images/trails/museum.webp',
	长文: '/images/trails/longform.webp',
	地图: '/images/trails/maps.webp',
	交互作品: '/images/trails/interactive.webp',
	代码实验: '/images/trails/code.webp',
};
```

At the start of `createCard`, create a decorative image and a body wrapper:

```ts
	const image = document.createElement('img');
	image.className = 'trail-card__image';
	image.src = TRAIL_VISUALS[trail.category];
	image.alt = '';
	image.loading = 'lazy';
	image.decoding = 'async';
	image.addEventListener('error', () => image.remove(), { once: true });

	const body = document.createElement('div');
	body.className = 'trail-card__body';
```

Append category, title and subtitle to `body`, then append `image` and `body` to the card. If a category has no mapping, skip the image instead of assigning an invalid URL.

- [ ] **Step 2: Style the visual card**

Use these layout rules in `src/pages/path.astro`:

```css
.trail-list :global(.trail-card) { display: flex; flex-direction: column; min-height: 520px; padding: 0; overflow: hidden; background: var(--cold-white); }
.trail-list :global(.trail-card__image) { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; background: var(--mist); }
.trail-list :global(.trail-card__body) { flex: 1; padding: clamp(1.4rem, 3vw, 2.4rem); }
```

On mobile, set the card minimum height to `auto`; keep the 4:3 image ratio and the existing single-column layout.

### Task 3: Verify image loading and existing behavior

**Files:**
- Modify: `tests/site.spec.ts`

- [ ] **Step 1: Extend the existing trail test**

After asserting three cards and three categories, add:

```ts
	const images = cards.locator('img.trail-card__image');
	await expect(images).toHaveCount(3);
	for (const image of await images.elementHandles()) {
		expect(await image.evaluate((node) => {
			const element = node as HTMLImageElement;
			return element.complete && element.naturalWidth > 0 && new URL(element.src).origin === location.origin;
		})).toBeTruthy();
	}
```

- [ ] **Step 2: Run the complete publish verification**

Run: `npm run verify:publish`

Expected: privacy scan, Astro check, build, and all Playwright tests pass.

- [ ] **Step 3: Check asset size and repository diff**

Run: `Get-ChildItem public/images/trails/*.webp | Select-Object Name,Length` and `git diff --check`.

Expected: six files exist, each is below 250 KB, and the diff has no whitespace errors.

### Task 4: Publish and inspect production

**Files:**
- Add: `public/images/trails/*.webp`
- Add: `docs/superpowers/plans/2026-09-22-trail-visuals.md`
- Modify: `docs/superpowers/specs/2026-09-22-trail-visuals-design.md`
- Modify: `src/scripts/trails.ts`
- Modify: `src/pages/path.astro`
- Modify: `tests/site.spec.ts`

- [ ] **Step 1: Commit verified files**

```powershell
git add -- public/images/trails docs/superpowers/specs/2026-09-22-trail-visuals-design.md docs/superpowers/plans/2026-09-22-trail-visuals.md src/scripts/trails.ts src/pages/path.astro tests/site.spec.ts
git commit -m "feat: add visual trail markers"
```

- [ ] **Step 2: Push the main branch**

Run: `git push origin main`

Expected: push succeeds and Cloudflare Pages starts a deployment.

- [ ] **Step 3: Inspect production**

Check `https://orange-wilds.pages.dev/path/` at desktop and 360px widths. Confirm three images load from `/images/trails/`, the cards remain usable, and redraw still returns three different categories.
