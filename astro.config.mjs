// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	site: process.env.SITE_URL ?? 'https://orange-wilds.pages.dev',
	integrations: [mdx(), sitemap()],
	output: 'static',
	trailingSlash: 'always',
});
