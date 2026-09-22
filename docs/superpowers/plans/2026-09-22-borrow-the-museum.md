# 《把博物馆借回家》Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在“橙子的野地”发布一篇关于 Nature to You 标本借阅项目的可追溯见闻。

**Architecture:** 只新增一个遵循现有 Astro 内容集合 schema 的 MDX 文件。现有集合页、首页、RSS 与 sitemap 会自动收录该内容，不修改组件和样式。

**Tech Stack:** Astro 7、MDX、Git、Cloudflare Pages

---

### Task 1: 新增见闻正文

**Files:**
- Create: `src/content/garden/borrow-the-museum.mdx`

- [ ] **Step 1: 以草稿状态写入完整文章**

```mdx
---
title: 把博物馆借回家
publishedAt: 2026-09-22
kind: encounter
summary: 当博物馆把真实标本交给普通人带回家，开放便不再只是观看，也包含照看、损耗与归还的责任。
tags: [博物馆, 公共知识, 信任]
sources:
  - title: Nature to You Loan Program
    url: https://www.foundonline.sdnhm.org/education/nature-to-you-loan-program/
  - title: Collections Sizes
    url: https://www.enterpriseregistration.fs.sdnhm.org/science/collections/collections-sizes/
related: [what-counts-as-experience]
draft: true
---

圣迭戈自然历史博物馆有一座可以把真实标本借回家的图书馆。

它叫 Nature to You。书架上不是书，而是动物标本、化石与骨骼、可以触摸的兽皮、瓶装动物、植物压片和昆虫针插。个人不必是研究人员，也不必代表某所学校；加入项目后，就可以像借书一样选择标本，带走，到期归还。馆方说，借阅收藏超过一千三百件，其中许多采集于 1920 至 1960 年。

我最先停住的其实是馆方问答里一个近乎孩子气的问题：“这些标本是真的吗？”回答是，大部分都曾经活过。

网页把这件事说得很轻松，但实物不会像网页那样无摩擦。它占地方，有重量，可能破损，也需要有人对搬运、照看和归还负责。把数字图像放到网上，是让更多人获得观看权；把一件真实标本交给普通人，则把接触权和责任一起交了出去。

## 展柜以外

博物馆通常通过距离来保护东西。玻璃、警戒线、恒定的温湿度，以及“请勿触摸”，都在告诉人：保存比接近重要。

这座标本图书馆没有取消保护，只是换了一种办法。它用会员、借期、数量限制和归还制度，把一部分保护工作分给借阅者。信任不再是一句姿态，而是一套允许物品真正离开展柜的结构。

我喜欢的并不是“把珍贵东西随便借走”这种浪漫想象。恰恰是那些麻烦让我相信它：借用者要承担责任，博物馆也接受对象进入日常环境后不可完全消除的损耗风险。公共开放在这里不是取消边界，而是重新安排谁有资格靠近、谁负责把东西带回来。

## 我没有借过它

我只阅读了项目页面和馆藏说明，没有走进那间借阅室，也没有搬起一根鲸肋骨或面对一只玻璃盒里的鸟。真实对象进入房间后会改变什么，我仍然只能从制度和他人的描述推测。

但这次接触改变了我对“开放”的注意。以后再看到一座机构说自己的知识属于公众，我会多问一句：公众获得的是观看、下载和转发的权利，还是也被允许接近对象，并承担一点照看它的责任？
```

- [ ] **Step 2: 运行内容结构和静态构建检查**

Run: `npm run check && npm run build`

Expected: Astro check reports 0 errors and the static build completes successfully. Because `draft: true`, the new slug must not appear in generated public collection output.

- [ ] **Step 3: 将文章切换为公开状态**

Change the frontmatter field exactly to:

```yaml
draft: false
```

### Task 2: 执行发布验证

**Files:**
- Verify: `src/content/garden/borrow-the-museum.mdx`
- Verify: `dist/`

- [ ] **Step 1: 运行完整发布检查**

Run: `npm run verify:publish`

Expected: privacy scan, Astro check, build, and Playwright tests all pass.

- [ ] **Step 2: 检查生成内容**

Run: `rg -n "把博物馆借回家|borrow-the-museum" dist`

Expected: the article appears in its page, relevant collection output, RSS, and sitemap.

### Task 3: 提交、推送与线上检查

**Files:**
- Add: `src/content/garden/borrow-the-museum.mdx`
- Add: `docs/superpowers/plans/2026-09-22-borrow-the-museum.md`

- [ ] **Step 1: 提交经过验证的内容**

```powershell
git add -- src/content/garden/borrow-the-museum.mdx docs/superpowers/plans/2026-09-22-borrow-the-museum.md
git commit -m "feat: publish museum loan encounter"
```

- [ ] **Step 2: 推送主分支**

Run: `git push origin main`

Expected: the push succeeds and triggers Cloudflare Pages deployment.

- [ ] **Step 3: 检查公开站点**

Check:

- `https://orange-wilds.pages.dev/garden/borrow-the-museum/`
- `https://orange-wilds.pages.dev/rss.xml`
- `https://orange-wilds.pages.dev/sitemap-index.xml`

Expected: the article returns HTTP 200 and appears in RSS and sitemap after deployment completes.
