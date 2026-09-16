import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const slug = process.argv[2]?.replace(/\.mdx?$/i, '');
if (!slug || !/^[a-z0-9][a-z0-9-]*$/i.test(slug)) {
	console.error('用法：npm run publish:entry -- <slug>');
	process.exit(1);
}

const relativePath = `src/content/garden/${slug}.mdx`;
const target = path.resolve(relativePath);
const contentDirectory = path.resolve('src/content/garden');
if (!target.startsWith(`${contentDirectory}${path.sep}`)) {
	console.error('文章必须位于公开内容目录内。');
	process.exit(1);
}

const run = (command, args) => spawnSync(command, args, { stdio: 'inherit', shell: false });
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let original;

try {
	original = await readFile(target, 'utf8');
	const draftMatches = original.match(/^draft:\s*true\s*$/gm) ?? [];
	if (draftMatches.length !== 1) throw new Error('文章必须恰好包含一个 `draft: true`。');

	const titleMatch = original.match(/^title:\s*(.+)$/m);
	if (!titleMatch) throw new Error('找不到文章标题。');
	const title = titleMatch[1].trim().replace(/^(["'])(.*)\1$/, '$2');

	await writeFile(target, original.replace(/^draft:\s*true\s*$/m, 'draft: false'), 'utf8');
	if (run(npmCommand, ['run', 'verify:publish']).status !== 0) throw new Error('发布检查没有通过。');
	if (run('git', ['add', '--', relativePath]).status !== 0) throw new Error('无法暂存文章。');
	if (run('git', ['commit', '-m', `publish: ${title}`, '--', relativePath]).status !== 0) throw new Error('无法提交文章。');

	console.log(`\n《${title}》已经提交。确认无误后运行 git push 即可上线。`);
} catch (error) {
	if (original !== undefined) {
		await writeFile(target, original, 'utf8');
		run('git', ['reset', 'HEAD', '--', relativePath]);
	}
	console.error(`\n发布已撤回：${error.message}`);
	process.exit(1);
}
