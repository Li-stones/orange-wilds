import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const targets = ['src/content', 'src/pages', 'src/data'];
const textExtensions = new Set(['.astro', '.md', '.mdx', '.json', '.ts', '.txt']);
const privateTerms = (process.env.ORANGE_PRIVATE_TERMS ?? '').split(',').map((term) => term.trim()).filter(Boolean);

const patterns = [
	['OpenAI-style API key', /\bsk-[A-Za-z0-9_-]{20,}\b/g],
	['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g],
	['Bearer credential', /\bBearer\s+[A-Za-z0-9._~-]{16,}\b/gi],
	['email address', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
	['mainland China mobile number', /(?<!\d)1[3-9]\d{9}(?!\d)/g],
	['absolute Windows path', /\b[A-Za-z]:\\(?:Users|Documents and Settings|Codex_Workspace)\\[^\s"'<>]+/g],
];

async function collect(directory) {
	const absolute = path.join(root, directory);
	const entries = await readdir(absolute, { withFileTypes: true, recursive: true });
	return entries.filter((entry) => entry.isFile() && textExtensions.has(path.extname(entry.name))).map((entry) => path.join(entry.parentPath, entry.name));
}

const files = (await Promise.all(targets.map(collect))).flat();
const findings = [];
for (const file of files) {
	const text = await readFile(file, 'utf8');
	for (const [label, pattern] of patterns) {
		pattern.lastIndex = 0;
		if (pattern.test(text)) findings.push(`${path.relative(root, file)}: ${label}`);
	}
	for (const term of privateTerms) {
		if (text.toLocaleLowerCase().includes(term.toLocaleLowerCase())) findings.push(`${path.relative(root, file)}: configured private term`);
	}
}

if (findings.length > 0) {
	console.error('Privacy scan failed:');
	for (const finding of findings) console.error(`- ${finding}`);
	process.exit(1);
}
console.log(`Privacy scan passed (${files.length} public source files).`);
