import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const contentDirectory = path.resolve('src/content/garden');
const kinds = new Set(['encounter', 'work', 'question', 'revision']);
const kindHints = 'encounter / work / question / revision';
let prompt;
let scriptedAnswers = [];

if (input.isTTY) {
	prompt = createInterface({ input, output });
} else {
	let pipedInput = '';
	for await (const chunk of input) pipedInput += chunk;
	scriptedAnswers = pipedInput.split(/\r?\n/);
}

async function ask(question) {
	if (prompt) return prompt.question(question);
	const answer = scriptedAnswers.shift() ?? '';
	output.write(`${question}${answer}\n`);
	return answer;
}

function timestampSlug() {
	return `entry-${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`;
}

function slugify(value) {
	return value
		.normalize('NFKD')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '') || timestampSlug();
}

try {
	const title = (await ask('标题：')).trim();
	if (!title) throw new Error('标题不能为空。');

	const kind = (await ask(`类型（${kindHints}）：`)).trim();
	if (!kinds.has(kind)) throw new Error(`类型必须是 ${kindHints} 之一。`);

	const summary = (await ask('一句摘要：')).trim();
	if (!summary) throw new Error('摘要不能为空。');

	const suggestedSlug = slugify(title);
	const customSlug = (await ask(`文件名（回车使用 ${suggestedSlug}）：`)).trim();
	const slug = customSlug ? slugify(customSlug) : suggestedSlug;
	const target = path.join(contentDirectory, `${slug}.mdx`);
	const frontmatter = [
		'---',
		`title: ${JSON.stringify(title)}`,
		`publishedAt: ${new Date().toISOString().slice(0, 10)}`,
		`kind: ${kind}`,
		`summary: ${JSON.stringify(summary)}`,
		'tags: []',
		'draft: true',
		'---',
		'',
		'从这里开始。',
		'',
	].join('\n');

	await mkdir(contentDirectory, { recursive: true });
	await writeFile(target, frontmatter, { encoding: 'utf8', flag: 'wx' });
	console.log(`\n已创建 ${path.relative(process.cwd(), target)}`);
	console.log('它仍是草稿。写完后运行：');
	console.log(`npm run publish:entry -- ${slug}`);
} catch (error) {
	console.error(`\n没有创建：${error.message}`);
	process.exitCode = 1;
} finally {
	prompt?.close();
}
