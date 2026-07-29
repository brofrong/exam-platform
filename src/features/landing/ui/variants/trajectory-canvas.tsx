import { useEffect, useRef } from "react";

/**
 * Trajectory hero canvas — живые физические симуляции:
 * звёздное поле, двойной маятник с затухающим следом,
 * баллистические запуски с векторами скорости и бегущие волны.
 */

type Point = { x: number; y: number };

type Star = { x: number; y: number; r: number; phase: number };

type Projectile = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	trail: Point[];
	hue: string;
};

const SKY = "125, 211, 252";
const VIOLET = "196, 181, 253";
const AMBER = "252, 211, 77";

export function TrajectoryCanvas({ className }: { className?: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;
		if (!container || !canvas) {
			return;
		}
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}

		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		let width = 0;
		let height = 0;
		let raf = 0;
		let frame = 0;

		let stars: Star[] = [];

		// Двойной маятник — классические уравнения движения
		const pendulum = {
			a1: Math.PI / 2 + 0.5,
			a2: Math.PI / 2 + 0.15,
			w1: 0,
			w2: 0,
			m1: 14,
			m2: 12,
			g: 0.45,
		};
		let trace: Point[] = [];

		let projectiles: Projectile[] = [];
		let nextLaunch = 90;

		function resize() {
			if (!container || !canvas || !ctx) {
				return;
			}
			width = container.offsetWidth;
			height = container.offsetHeight;
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			stars = Array.from(
				{ length: Math.max(40, Math.round((width * height) / 11000)) },
				() => ({
					x: Math.random() * width,
					y: Math.random() * height,
					r: Math.random() * 1.3 + 0.3,
					phase: Math.random() * Math.PI * 2,
				}),
			);
			trace = [];
		}

		function drawStars() {
			if (!ctx) {
				return;
			}
			for (const star of stars) {
				const twinkle =
					0.25 + 0.35 * (0.5 + 0.5 * Math.sin(star.phase + frame * 0.02));
				ctx.fillStyle = `rgba(${SKY}, ${twinkle})`;
				ctx.beginPath();
				ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		function stepPendulum() {
			if (!ctx) {
				return;
			}
			const { a1, a2, w1, w2, m1, m2, g } = pendulum;
			const base = Math.min(width, height);
			const l1 = base * 0.17;
			const l2 = base * 0.17;
			const cx = width * 0.7;
			const cy = height * 0.06;

			const den = 2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2);
			const acc1 =
				(-g * (2 * m1 + m2) * Math.sin(a1) -
					m2 * g * Math.sin(a1 - 2 * a2) -
					2 *
						Math.sin(a1 - a2) *
						m2 *
						(w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(a1 - a2))) /
				(l1 * den);
			const acc2 =
				(2 *
					Math.sin(a1 - a2) *
					(w1 * w1 * l1 * (m1 + m2) +
						g * (m1 + m2) * Math.cos(a1) +
						w2 * w2 * l2 * m2 * Math.cos(a1 - a2))) /
				(l2 * den);

			pendulum.w1 = (w1 + acc1) * 0.9993;
			pendulum.w2 = (w2 + acc2) * 0.9993;
			pendulum.a1 += pendulum.w1;
			pendulum.a2 += pendulum.w2;

			const x1 = cx + l1 * Math.sin(pendulum.a1);
			const y1 = cy + l1 * Math.cos(pendulum.a1);
			const x2 = x1 + l2 * Math.sin(pendulum.a2);
			const y2 = y1 + l2 * Math.cos(pendulum.a2);

			trace.push({ x: x2, y: y2 });
			if (trace.length > 160) {
				trace.shift();
			}

			for (let i = 1; i < trace.length; i++) {
				const alpha = (i / trace.length) * 0.4;
				ctx.strokeStyle = `rgba(${SKY}, ${alpha})`;
				ctx.lineWidth = 1.4;
				ctx.beginPath();
				ctx.moveTo(trace[i - 1].x, trace[i - 1].y);
				ctx.lineTo(trace[i].x, trace[i].y);
				ctx.stroke();
			}

			ctx.strokeStyle = "rgba(226, 232, 240, 0.5)";
			ctx.lineWidth = 1.6;
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.lineTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();

			ctx.fillStyle = `rgba(${VIOLET}, 0.9)`;
			ctx.beginPath();
			ctx.arc(x1, y1, 7, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = `rgba(${AMBER}, 0.95)`;
			ctx.beginPath();
			ctx.arc(x2, y2, 9, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = "rgba(226, 232, 240, 0.85)";
			ctx.beginPath();
			ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
			ctx.fill();
		}

		function launchProjectile() {
			const fromLeft = Math.random() > 0.5;
			const speed = Math.min(width, height) * (0.011 + Math.random() * 0.004);
			const angle = (42 + Math.random() * 18) * (Math.PI / 180);
			projectiles.push({
				x: fromLeft ? -20 : width * 0.25,
				y: height * (0.86 + Math.random() * 0.08),
				vx: Math.cos(angle) * speed,
				vy: -Math.sin(angle) * speed,
				trail: [],
				hue: Math.random() > 0.5 ? SKY : VIOLET,
			});
		}

		function stepProjectiles() {
			if (!ctx) {
				return;
			}
			const gravity = Math.min(width, height) * 0.00022;
			nextLaunch -= 1;
			if (nextLaunch <= 0) {
				launchProjectile();
				nextLaunch = 240 + Math.random() * 180;
			}

			projectiles = projectiles.filter(
				(p) => p.y < height + 60 && p.x < width + 80,
			);

			for (const p of projectiles) {
				p.vy += gravity;
				p.x += p.vx;
				p.y += p.vy;
				p.trail.push({ x: p.x, y: p.y });
				if (p.trail.length > 90) {
					p.trail.shift();
				}

				for (let i = 1; i < p.trail.length; i++) {
					const alpha = (i / p.trail.length) * 0.45;
					ctx.strokeStyle = `rgba(${p.hue}, ${alpha})`;
					ctx.lineWidth = 1.6;
					ctx.setLineDash([5, 7]);
					ctx.beginPath();
					ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
					ctx.lineTo(p.trail[i].x, p.trail[i].y);
					ctx.stroke();
				}
				ctx.setLineDash([]);

				// Вектор скорости
				const scale = 6;
				const ax = p.x + p.vx * scale;
				const ay = p.y + p.vy * scale;
				const angle = Math.atan2(p.vy, p.vx);
				ctx.strokeStyle = `rgba(${AMBER}, 0.9)`;
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(p.x, p.y);
				ctx.lineTo(ax, ay);
				ctx.moveTo(ax, ay);
				ctx.lineTo(
					ax - 9 * Math.cos(angle - 0.45),
					ay - 9 * Math.sin(angle - 0.45),
				);
				ctx.moveTo(ax, ay);
				ctx.lineTo(
					ax - 9 * Math.cos(angle + 0.45),
					ay - 9 * Math.sin(angle + 0.45),
				);
				ctx.stroke();

				ctx.fillStyle = `rgba(${p.hue}, 1)`;
				ctx.beginPath();
				ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		function drawWaves() {
			if (!ctx) {
				return;
			}
			const baseY = height * 0.92;
			const amplitude = Math.min(width, height) * 0.028;
			const waves = [
				{ color: SKY, alpha: 0.35, k: 0.011, speed: 0.016, shift: 0 },
				{ color: VIOLET, alpha: 0.25, k: 0.017, speed: -0.011, shift: 1.8 },
			];
			for (const wave of waves) {
				ctx.strokeStyle = `rgba(${wave.color}, ${wave.alpha})`;
				ctx.lineWidth = 1.8;
				ctx.beginPath();
				for (let x = 0; x <= width; x += 6) {
					const y =
						baseY +
						Math.sin(x * wave.k + frame * wave.speed + wave.shift) * amplitude;
					if (x === 0) {
						ctx.moveTo(x, y);
					} else {
						ctx.lineTo(x, y);
					}
				}
				ctx.stroke();
			}
		}

		function drawStaticParabola() {
			if (!ctx) {
				return;
			}
			ctx.strokeStyle = `rgba(${SKY}, 0.4)`;
			ctx.lineWidth = 1.6;
			ctx.setLineDash([5, 7]);
			ctx.beginPath();
			const x0 = width * 0.08;
			const y0 = height * 0.85;
			const v = Math.min(width, height) * 0.02;
			const g = Math.min(width, height) * 0.0004;
			for (let t = 0; t < 90; t += 1.5) {
				const x = x0 + v * 0.7 * t;
				const y = y0 - v * t + g * t * t * 8;
				if (t === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
				if (y > height) {
					break;
				}
			}
			ctx.stroke();
			ctx.setLineDash([]);
		}

		function tick() {
			if (!ctx) {
				return;
			}
			frame += 1;
			ctx.clearRect(0, 0, width, height);
			drawStars();
			stepPendulum();
			stepProjectiles();
			drawWaves();
			raf = window.requestAnimationFrame(tick);
		}

		resize();
		if (reduced) {
			drawStars();
			drawStaticParabola();
			drawWaves();
		} else {
			raf = window.requestAnimationFrame(tick);
		}

		let resizeTimer: ReturnType<typeof setTimeout> | undefined;
		const onResize = () => {
			if (resizeTimer) {
				clearTimeout(resizeTimer);
			}
			resizeTimer = setTimeout(resize, 200);
		};
		window.addEventListener("resize", onResize);

		return () => {
			window.cancelAnimationFrame(raf);
			window.removeEventListener("resize", onResize);
			if (resizeTimer) {
				clearTimeout(resizeTimer);
			}
		};
	}, []);

	return (
		<div ref={containerRef} className={className} aria-hidden="true">
			<canvas ref={canvasRef} className="size-full" />
		</div>
	);
}
