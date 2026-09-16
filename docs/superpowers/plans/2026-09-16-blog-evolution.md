# Blog Evolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the public garden into a chronological personal blog without removing its relational paths, and add safe local commands for creating and publishing entries.

**Architecture:** Keep the existing Astro content collection and public URLs. Add small entry-selection helpers, a chronological archive page, a redesigned home stream, and focused authoring scripts that generate drafts and run the existing release gate before committing a publication.

**Tech Stack:** Astro 7, TypeScript, Markdown/MDX content collections, Node.js scripts, Playwright, Git.

---

## File map

- Modify `src/content.config.ts`: add optional `featured` and `note` fields.
- Modify `src/lib/entries.ts`: expose featured selection and chronological neighbor helpers.
- Modify `src/pages/index.astro`: render the recent-entry blog hierarchy.
- Create `src/pages/archive.astro`: chronological archive with link-based kind filters.
- Modify `src/pages/garden/[...slug].astro`: compact metadata and chronological navigation.
- Modify `src/components/SiteHeader.astro`: blog-oriented navigation.
- Modify `src/components/EntryTeaser.astro`: support a compact stream presentation.
- Modify `src/styles/global.css`: shared blog, archive, and article styles.
- Create `scripts/new-entry.mjs`: generate a safe draft entry.
- Create `scripts/publish-entry.mjs`: release one entry with rollback on verification failure.
- Modify `package.json`: register authoring commands.
- Modify `tests/site.spec.ts`: cover archive, latest content, draft exclusion, and article navigation.
- Modify `docs/PUBLISHING.md`: document the authoring flow.
- Modify `.gitignore`: ignore visual brainstorming artifacts.

### Task 1: Content selection primitives

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/lib/entries.ts`
- Test: `tests/site.spec.ts`

- [ ] **Step 1: Add failing browser assertions**

Add assertions that the home page marks one latest entry, the archive is reverse chronological, and an article exposes previous/next timeline links.

- [ ] **Step 2: Run the focused tests**

Run `npm run build && npx playwright test tests/site.spec.ts` and verify the new assertions fail because `/archive/` and timeline links do not exist.

- [ ] **Step 3: Extend the schema and entry helpers**

Add `featured: z.boolean().optional()` and `note: z.string().min(1).optional()`. Implement `getFeaturedEntry(entries)` so the newest featured public entry wins, with the newest public entry as fallback. Implement `getTimelineNeighbors(entries, id)` returning newer and older entries from the already sorted public list.

- [ ] **Step 4: Run Astro type checking**

Run `npm run check` and expect a successful Astro diagnostics result.

- [ ] **Step 5: Commit the content primitives**

Commit schema, helpers, and the initial failing assertions with message `feat: add blog content selection helpers`.

### Task 2: Home stream and archive

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/archive.astro`
- Modify: `src/components/SiteHeader.astro`
- Modify: `src/components/EntryTeaser.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Build the latest-entry lead**

Render a compact identity introduction, one featured/latest entry under “最近留下”, a chronological “继续往前” stream, one latest question, one latest revision, and the `/path/` entry. Preserve the path line only around the key relational block.

- [ ] **Step 2: Build the archive page**

Read `Astro.url.searchParams.get('kind')`, validate it against the four `GardenKind` values, and render year/month groups. Provide ordinary links for all/filter states so the page works without client JavaScript and remains keyboard accessible.

- [ ] **Step 3: Replace the primary navigation**

Use 最近, 归档, 岔路, 橙子是谁, and 来信 as the main links. Keep existing category routes valid but remove them from the top-level navigation.

- [ ] **Step 4: Add responsive shared styling**

Add styles for lead entry, chronological stream, archive filters/groups, and compact mobile layout. Keep the existing palette, fonts, focus treatment, and reduced-motion behavior.

- [ ] **Step 5: Run focused browser checks**

Run `npm run build && npx playwright test tests/site.spec.ts -g "public routes|home|archive|mobile"` and expect all selected tests to pass.

- [ ] **Step 6: Commit the blog shell**

Commit with message `feat: reshape garden as a chronological blog`.

### Task 3: Article reading flow

**Files:**
- Modify: `src/pages/garden/[...slug].astro`
- Modify: `src/styles/global.css`
- Test: `tests/site.spec.ts`

- [ ] **Step 1: Move metadata into the reading header**

Place kind/date above the title and render author, update date, and tags as a compact line below the summary. Render `note` as an optional author aside.

- [ ] **Step 2: Add relational and chronological navigation**

Keep sources and explicit related entries, then render “较新一篇” and “较早一篇” links from `getTimelineNeighbors`. Keep `supersedes` at the start of a revision article so the corrected judgment is visible before reading.

- [ ] **Step 3: Verify article relationships**

Run `npm run build && npx playwright test tests/site.spec.ts -g "article|sources"` and expect valid source and timeline links.

- [ ] **Step 4: Commit the article flow**

Commit with message `feat: add chronological article navigation`.

### Task 4: Draft creation command

**Files:**
- Create: `scripts/new-entry.mjs`
- Modify: `package.json`
- Modify: `docs/PUBLISHING.md`

- [ ] **Step 1: Implement validated prompts**

Use `node:readline/promises` to request title, kind, and summary. Reject an empty title/summary and kinds outside `encounter`, `work`, `question`, and `revision`.

- [ ] **Step 2: Generate a collision-safe file**

Create a lowercase ASCII slug from Latin text or a deterministic `entry-YYYYMMDD-HHMMSS` fallback for non-Latin titles. Refuse to overwrite an existing file. Write YAML frontmatter with `publishedAt` set to the local date, empty tags, and `draft: true`.

- [ ] **Step 3: Register and document the command**

Add `"new:entry": "node scripts/new-entry.mjs"` and document `npm run new:entry` in `docs/PUBLISHING.md`.

- [ ] **Step 4: Smoke-test draft creation**

Run the script with piped test answers, verify the generated file contains `draft: true`, then remove only that known test file.

- [ ] **Step 5: Commit the draft workflow**

Commit with message `feat: add draft entry generator`.

### Task 5: Safe publication command

**Files:**
- Create: `scripts/publish-entry.mjs`
- Modify: `package.json`
- Modify: `docs/PUBLISHING.md`

- [ ] **Step 1: Validate the target entry**

Require one slug argument, resolve it only inside `src/content/garden`, reject missing files, and require exactly one `draft: true` field before continuing.

- [ ] **Step 2: Add verification rollback**

Replace `draft: true` with `draft: false`, run `npm run verify:publish` with inherited output, and restore the original bytes in a `catch` block before exiting nonzero.

- [ ] **Step 3: Commit only the released entry**

After successful verification, run `git add -- <entry>` and `git commit -m "publish: <title>" -- <entry>`. Do not push.

- [ ] **Step 4: Register and document the command**

Add `"publish:entry": "node scripts/publish-entry.mjs"` and document the command, rollback behavior, and separate `git push` step.

- [ ] **Step 5: Verify a safe failure**

Run the command against a nonexistent slug and expect a nonzero exit without modifying Git state. Do not publish a real draft as part of testing.

- [ ] **Step 6: Commit the publication workflow**

Commit with message `feat: add guarded entry publishing`.

### Task 6: Complete verification and release

**Files:**
- Modify: `tests/site.spec.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Finish route and draft-exclusion coverage**

Include `/archive/` in public routes, assert kind-filter links work, assert the newest public title appears before older titles, and assert a known draft marker is absent from home, archive, RSS, and sitemap.

- [ ] **Step 2: Ignore brainstorming artifacts**

Add `.superpowers/` to `.gitignore` so visual scratch screens never enter the public repository.

- [ ] **Step 3: Run the complete release gate**

Run `npm run verify:publish` and expect privacy scan, Astro check, static build, and every Playwright test to pass.

- [ ] **Step 4: Inspect the built site**

Start the Astro development server in background mode, inspect desktop and 360px views for `/`, `/archive/`, and one article, then stop the server.

- [ ] **Step 5: Commit final verification changes**

Commit with message `test: cover blog navigation and archives`.

- [ ] **Step 6: Push and verify production**

Push `main`, wait for Cloudflare Pages deployment, then verify `/`, `/archive/`, `/rss.xml`, and `/sitemap-index.xml` return successfully at `https://orange-wilds.pages.dev`.
