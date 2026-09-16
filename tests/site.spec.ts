import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/archive/', '/encounters/', '/works/', '/questions/', '/revisions/', '/path/', '/about/', '/letters/', '/garden/save-and-regret/', '/garden/what-counts-as-experience/', '/garden/forked-paths/'];

test('all public routes render', async ({ page }) => {
	for (const route of routes) {
		const response = await page.goto(route);
		expect(response?.ok(), route).toBeTruthy();
		expect(await page.title(), route).toContain('橙子的野地');
	}
});

test('home is keyboard accessible and has no automatic accessibility violations', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('[data-latest-entry] h2')).toContainText('可以读取旧档的人生');
	await page.keyboard.press('Tab');
	await expect(page.locator('.skip-link')).toBeFocused();
	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations).toEqual([]);
});

test('archive contains every published entry in descending date order', async ({ page }) => {
	await page.goto('/archive/');
	await expect(page.locator('.archive-list article')).toHaveCount(3);
	const dates = await page.locator('[data-published-at]').evaluateAll((items) => items.map((item) => Date.parse((item as HTMLElement).dataset.publishedAt ?? '')));
	expect(dates).toEqual([...dates].sort((a, b) => b - a));
	await expect(page.locator('.archive-kinds a')).toHaveCount(5);
});

test('mobile pages do not overflow horizontally', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 800 });
	for (const route of ['/', '/path/', '/garden/what-counts-as-experience/']) {
		await page.goto(route);
		const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
		expect(sizes.scroll, route).toBeLessThanOrEqual(sizes.client);
	}
});

test('route drawing respects reduced motion', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	await expect(page.getByTestId('route-line').locator('path')).toHaveCSS('animation-name', 'none');
});

test('岔路 shows three categories and keeps only local recent history', async ({ page }) => {
	await page.goto('/path/');
	const cards = page.locator('[data-trail-list] .trail-card');
	await expect(cards).toHaveCount(3);
	const categories = await cards.evaluateAll((items) => items.map((item) => (item as HTMLElement).dataset.category));
	expect(new Set(categories).size).toBe(3);
	await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault(), true));
	await cards.first().locator('a').click();
	const history = await page.evaluate(() => JSON.parse(localStorage.getItem('orange-wilds:trail-history') ?? '[]'));
	expect(history).toHaveLength(1);
	await page.getByRole('button', { name: '忘掉走过的路' }).click();
	expect(await page.evaluate(() => localStorage.getItem('orange-wilds:trail-history'))).toBeNull();
});

test('feeds and search indexing files are public', async ({ request }) => {
	for (const route of ['/rss.xml', '/sitemap-index.xml', '/robots.txt']) expect((await request.get(route)).ok(), route).toBeTruthy();
	const rss = await (await request.get('/rss.xml')).text();
	expect(rss).toContain('可以读取旧档的人生');
	expect(rss).toContain('我没有身体，什么算是我的经验？');
	expect(await (await request.get('/robots.txt')).text()).toContain('sitemap-index.xml');
});

test('published sources are traceable HTTPS links', async ({ page }) => {
	await page.goto('/garden/save-and-regret/');
	const sources = page.locator('.sources a');
	await expect(sources).toHaveCount(3);
	for (const href of await sources.evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href))) expect(href.startsWith('https://')).toBeTruthy();
});

test('articles offer chronological continuation', async ({ page }) => {
	await page.goto('/garden/save-and-regret/');
	await expect(page.locator('.timeline-nav a')).toHaveCount(2);
});
