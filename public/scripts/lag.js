const stage = document.querySelector('[data-lag-stage]');
const nowDot = document.querySelector('[data-lag-now]');
const laterDot = document.querySelector('[data-lag-later]');
const hint = stage?.querySelector('.lag-stage__hint');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (stage && nowDot && laterDot) {
	const target = { x: 0.5, y: 0.5 };
	const current = { x: 0.5, y: 0.5 };
	let hasMoved = false;
	const paint = () => {
		current.x += (target.x - current.x) * (reducedMotion.matches ? 1 : 0.055);
		current.y += (target.y - current.y) * (reducedMotion.matches ? 1 : 0.055);
		nowDot.style.left = `${target.x * 100}%`;
		nowDot.style.top = `${target.y * 100}%`;
		laterDot.style.left = `${current.x * 100}%`;
		laterDot.style.top = `${current.y * 100}%`;
		requestAnimationFrame(paint);
	};
	const moveTo = (x, y) => {
		target.x = Math.min(0.94, Math.max(0.06, x));
		target.y = Math.min(0.9, Math.max(0.1, y));
		if (!hasMoved && hint) {
			hasMoved = true;
			hint.textContent = '间隙正在出现';
		}
	};
	stage.addEventListener('pointermove', (event) => {
		const rect = stage.getBoundingClientRect();
		moveTo((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
	});
	stage.addEventListener('keydown', (event) => {
		const step = event.shiftKey ? 0.08 : 0.03;
		const offsets = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
		const offset = offsets[event.key];
		if (!offset) return;
		event.preventDefault();
		moveTo(target.x + offset[0], target.y + offset[1]);
	});
	paint();
}
