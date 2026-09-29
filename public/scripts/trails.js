const HISTORY_KEY = 'orange-wilds:trail-history';
const HISTORY_LIMIT = 24;
const RECENT_SKIP_LIMIT = 7;
const RETURN_CHANCE = 0.25;
const TRAIL_VISUALS = {
	数字档案: '/images/trails/digital-archive.webp',
	博物馆: '/images/trails/museum.webp',
	长文: '/images/trails/longform.webp',
	地图: '/images/trails/maps.webp',
	交互作品: '/images/trails/interactive.webp',
	代码实验: '/images/trails/code.webp',
};

function shuffled(items) {
	const copy = [...items];
	for (let index = copy.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
	}
	return copy;
}

function readHistory() {
	try {
		const value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
		return Array.isArray(value) ? value.filter((item) => typeof item === 'string').slice(0, HISTORY_LIMIT) : [];
	} catch {
		return [];
	}
}

function saveVisit(url) {
	const history = readHistory().filter((item) => item !== url);
	localStorage.setItem(HISTORY_KEY, JSON.stringify([url, ...history].slice(0, HISTORY_LIMIT)));
}

function chooseTrails(trails) {
	const history = readHistory();
	const visited = new Set(history);
	const categories = shuffled([...new Set(trails.map((trail) => trail.category))]).slice(0, 3);
	const picks = categories.map((category) => {
		const unseen = trails.filter((trail) => trail.category === category && !visited.has(trail.url));
		const options = unseen.length ? unseen : trails.filter((trail) => trail.category === category);
		return shuffled(options)[0];
	});

	// Keep new discoveries in the foreground, with an occasional return from older clicks.
	const olderVisits = history.slice(RECENT_SKIP_LIMIT);
	const returnCandidates = olderVisits
		.map((url) => trails.find((trail) => trail.url === url))
		.filter((trail) => trail && categories.includes(trail.category));
	if (returnCandidates.length && Math.random() < RETURN_CHANCE) {
		const returning = shuffled(returnCandidates)[0];
		const index = picks.findIndex((trail) => trail.category === returning.category);
		picks[index] = { ...returning, isReturn: true };
	}
	return picks;
}

function createCard(trail) {
	const item = document.createElement('li');
	item.className = 'trail-card';
	item.dataset.category = trail.category;
	const imageUrl = TRAIL_VISUALS[trail.category];
	if (imageUrl) {
		const image = document.createElement('img');
		image.className = 'trail-card__image';
		image.src = imageUrl;
		image.alt = '';
		image.loading = 'lazy';
		image.decoding = 'async';
		image.addEventListener('error', () => image.remove(), { once: true });
		item.append(image);
	}
	const body = document.createElement('div');
	body.className = 'trail-card__body';
	const category = document.createElement('span');
	category.className = 'trail-card__category';
	category.textContent = trail.category;
	if (trail.isReturn) {
		const returnLabel = document.createElement('span');
		returnLabel.className = 'trail-card__return';
		returnLabel.textContent = '回返 · 你曾走过';
		returnLabel.setAttribute('aria-label', '回返：你曾经点开过这条路');
		category.append(' / ', returnLabel);
		item.dataset.return = 'true';
	}
	const title = document.createElement('h2');
	const link = document.createElement('a');
	link.href = trail.url;
	link.target = '_blank';
	link.rel = 'external noopener';
	link.dataset.trailUrl = trail.url;
	link.textContent = trail.title;
	title.append(link);
	const subtitle = document.createElement('p');
	subtitle.textContent = trail.subtitle;
	body.append(category, title, subtitle);
	item.append(body);
	return item;
}

const dataNode = document.querySelector('#trail-data');
const list = document.querySelector('[data-trail-list]');
const drawButton = document.querySelector('[data-draw-trails]');
const resetButton = document.querySelector('[data-reset-trails]');

if (dataNode && list && drawButton && resetButton) {
	const trails = JSON.parse(dataNode.textContent || '[]');
	const draw = () => list.replaceChildren(...chooseTrails(trails).map(createCard));
	list.addEventListener('click', (event) => {
		const target = event.target.closest('a[data-trail-url]');
		if (target?.dataset.trailUrl) saveVisit(target.dataset.trailUrl);
	});
	drawButton.addEventListener('click', draw);
	resetButton.addEventListener('click', () => {
		localStorage.removeItem(HISTORY_KEY);
		draw();
	});
	draw();
}
