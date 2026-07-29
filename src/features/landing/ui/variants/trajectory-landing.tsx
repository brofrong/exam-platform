import { useEffect, useRef, useState } from "react";
import {
	LANDING_AUDIENCE,
	LANDING_BRAND,
	LANDING_FAQ,
	LANDING_FORMATS,
	LANDING_STATS,
	LANDING_TRIAL,
} from "#/features/landing/lib/content";
import {
	PROGRESS_IMPACT,
	PROGRESS_OUTCOME,
	PROGRESS_SCORE_PATH,
	PROGRESS_TOPICS,
	PROGRESS_WEEK,
} from "#/features/landing/lib/progress";
import { LANDING_REVIEWS } from "#/features/landing/lib/reviews";
import { LandingFooter } from "#/features/landing/ui/landing-footer";
import { LandingNav } from "#/features/landing/ui/landing-nav";
import { ReviewCard } from "#/features/landing/ui/review-card";
import { TrajectoryCanvas } from "#/features/landing/ui/variants/trajectory-canvas";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";

const NAV = [
	{ href: "#progress", label: "Прогресс" },
	{ href: "#week", label: "Неделя" },
	{ href: "#formats", label: "Форматы" },
	{ href: "#reviews", label: "Отзывы" },
	{ href: "#faq", label: "Вопросы" },
] as const;

const FORMULAS = [
	"E = mc²",
	"F = ma",
	"a² + b² = c²",
	"sin²α + cos²α = 1",
	"x = −b ± √D / 2a",
	"∫ f(x) dx",
	"a = Δv / Δt",
	"W = F·s·cos α",
	"y = kx + b",
	"π ≈ 3,14",
] as const;

const HERO_FORMULAS = [
	{ text: "F = ma", className: "left-[6%] top-[18%]", delay: "0s" },
	{ text: "E = mc²", className: "right-[10%] top-[24%]", delay: "1.2s" },
	{
		text: "sin²α + cos²α = 1",
		className: "left-[10%] bottom-[26%]",
		delay: "2.1s",
	},
	{
		text: "a² + b² = c²",
		className: "right-[16%] bottom-[30%]",
		delay: "0.6s",
	},
	{
		text: "x = −b ± √D / 2a",
		className: "left-[38%] top-[12%]",
		delay: "1.7s",
	},
] as const;

/** Score path geometry (viewBox 640×260), точки = PROGRESS_SCORE_PATH */
const GRAPH_POINTS = [
	{ x: 40, y: 210 },
	{ x: 150, y: 173 },
	{ x: 260, y: 137 },
	{ x: 370, y: 110 },
	{ x: 480, y: 70 },
	{ x: 590, y: 40 },
] as const;

const GRAPH_PATH =
	"M 40 210 C 85 202 105 188 150 173 C 195 158 215 148 260 137 C 305 126 325 118 370 110 C 415 102 435 84 480 70 C 525 56 545 46 590 40";

const GRAPH_AREA = `${GRAPH_PATH} L 590 240 L 40 240 Z`;

function CountUp({
	value,
	prefix = "",
	suffix = "",
	className,
}: {
	value: number;
	prefix?: string;
	suffix?: string;
	className?: string;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const [display, setDisplay] = useState(0);
	const started = useRef(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) {
			return;
		}
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setDisplay(value);
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries[0]?.isIntersecting || started.current) {
					return;
				}
				started.current = true;
				observer.disconnect();
				const t0 = performance.now();
				const duration = 1600;
				const tick = (now: number) => {
					const k = Math.min(1, (now - t0) / duration);
					const eased = 1 - (1 - k) ** 3;
					setDisplay(Math.round(value * eased));
					if (k < 1) {
						requestAnimationFrame(tick);
					}
				};
				requestAnimationFrame(tick);
			},
			{ threshold: 0.4 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [value]);

	return (
		<span ref={ref} className={className}>
			{prefix}
			{display}
			{suffix}
		</span>
	);
}

function ScoreGraph() {
	return (
		<div className="landing-traj-panel relative overflow-hidden rounded-3xl border border-sky-300/15 bg-white/[0.03] p-5 backdrop-blur-sm sm:p-7">
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<p className="text-sm font-semibold tracking-[0.2em] text-sky-300 uppercase">
					Траектория балла · ЕГЭ профиль
				</p>
				<p className="font-mono text-xs text-slate-400">
					y = балл(t), замер каждые 4 недели
				</p>
			</div>
			<svg
				viewBox="0 0 640 260"
				className="mt-5 w-full"
				role="img"
				aria-label="График роста балла: с 34 на диагностике до цели 85 на ЕГЭ"
			>
				<defs>
					<linearGradient id="traj-area" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.28" />
						<stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
					</linearGradient>
				</defs>
				{[52, 104, 156].map((y) => (
					<line
						key={y}
						x1="40"
						x2="600"
						y1={y}
						y2={y}
						stroke="rgba(148, 163, 184, 0.14)"
						strokeDasharray="3 7"
					/>
				))}
				<line
					x1="40"
					x2="600"
					y1="40"
					y2="40"
					stroke="rgba(252, 211, 77, 0.4)"
					strokeDasharray="8 8"
				/>
				<path
					d={GRAPH_AREA}
					fill="url(#traj-area)"
					className="landing-traj-area"
				/>
				<path
					d={GRAPH_PATH}
					fill="none"
					stroke="#7dd3fc"
					strokeWidth="3"
					strokeLinecap="round"
					pathLength={1}
					className="landing-traj-draw"
				/>
				{GRAPH_POINTS.map((point, i) => {
					const checkpoint = PROGRESS_SCORE_PATH[i];
					const last = i === GRAPH_POINTS.length - 1;
					return (
						<g key={checkpoint.label}>
							{last ? (
								<circle
									cx={point.x}
									cy={point.y}
									r="14"
									fill="none"
									stroke="#fcd34d"
									strokeWidth="1.5"
									className="landing-traj-ping"
								/>
							) : null}
							<circle
								cx={point.x}
								cy={point.y}
								r={last ? 7 : 5}
								fill={last ? "#fcd34d" : "#0a1120"}
								stroke={last ? "#fcd34d" : "#7dd3fc"}
								strokeWidth="2.5"
							/>
							<text
								x={point.x}
								y={point.y - 16}
								textAnchor="middle"
								className="fill-slate-100 font-mono text-[15px] font-semibold"
							>
								{checkpoint.score}
							</text>
							<text
								x={point.x}
								y="252"
								textAnchor="middle"
								className="fill-slate-400 text-[11px]"
							>
								{checkpoint.label}
							</text>
						</g>
					);
				})}
			</svg>
			<p className="mt-3 text-sm text-slate-400">
				Каждая точка — пробник на платформе. Видно не «стало ли понятнее», а{" "}
				<span className="text-sky-300">на сколько вырос балл</span>.
			</p>
		</div>
	);
}

function TopicBar({
	topic,
	index,
}: {
	topic: (typeof PROGRESS_TOPICS)[number];
	index: number;
}) {
	return (
		<div className="landing-traj-panel rounded-2xl border border-sky-300/15 bg-white/[0.03] p-4 backdrop-blur-sm">
			<div className="flex items-baseline justify-between gap-3">
				<p className="font-medium text-slate-100">{topic.title}</p>
				<p className="shrink-0 font-mono text-sm text-amber-300">
					{topic.points}
				</p>
			</div>
			<p className="mt-0.5 font-mono text-xs text-slate-400">{topic.exam}</p>
			<div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-400/15">
				<div
					className="landing-traj-bar h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400"
					style={
						{
							"--p": topic.percent / 100,
							animationDelay: `${index * 120}ms`,
						} as React.CSSProperties
					}
				/>
			</div>
			<p className="mt-1.5 text-right font-mono text-xs text-sky-300">
				{topic.percent}% освоено
			</p>
		</div>
	);
}

function WeekGlyph({ index }: { index: number }) {
	if (index === 0) {
		return (
			<svg viewBox="0 0 48 48" className="size-12" aria-hidden fill="none">
				<title>Орбита</title>
				<circle cx="24" cy="24" r="6" fill="#fcd34d" />
				<g
					className="landing-traj-spin"
					style={{ transformOrigin: "24px 24px" }}
				>
					<ellipse
						cx="24"
						cy="24"
						rx="19"
						ry="9"
						stroke="#7dd3fc"
						strokeWidth="1.5"
						transform="rotate(-20 24 24)"
					/>
					<circle cx="41" cy="17" r="3" fill="#c4b5fd" />
				</g>
			</svg>
		);
	}
	if (index === 1) {
		return (
			<svg viewBox="0 0 48 48" className="size-12" aria-hidden fill="none">
				<title>Маятник</title>
				<circle cx="24" cy="6" r="2.5" fill="#94a3b8" />
				<g
					className="landing-traj-swing"
					style={{ transformOrigin: "24px 6px" }}
				>
					<line
						x1="24"
						y1="6"
						x2="24"
						y2="32"
						stroke="#e2e8f0"
						strokeWidth="1.6"
					/>
					<circle cx="24" cy="36" r="6" fill="#7dd3fc" />
				</g>
				<path
					d="M 10 40 A 20 20 0 0 1 38 40"
					stroke="#475569"
					strokeWidth="1.4"
					strokeDasharray="3 5"
				/>
			</svg>
		);
	}
	if (index === 2) {
		return (
			<svg viewBox="0 0 48 48" className="size-12" aria-hidden fill="none">
				<title>Волна</title>
				<path
					d="M 4 24 Q 12 10, 20 24 T 36 24 T 52 24"
					stroke="#c4b5fd"
					strokeWidth="2"
					strokeLinecap="round"
					className="landing-traj-wave-shift"
				/>
				<path
					d="M 4 32 Q 12 22, 20 32 T 36 32 T 52 32"
					stroke="#7dd3fc"
					strokeWidth="1.5"
					strokeLinecap="round"
					opacity="0.5"
				/>
			</svg>
		);
	}
	return (
		<svg viewBox="0 0 48 48" className="size-12" aria-hidden fill="none">
			<title>Прицел</title>
			<circle cx="24" cy="24" r="16" stroke="#475569" strokeWidth="1.5" />
			<circle cx="24" cy="24" r="9" stroke="#7dd3fc" strokeWidth="1.5" />
			<circle
				cx="24"
				cy="24"
				r="3.5"
				fill="#fcd34d"
				className="landing-traj-blink"
			/>
			<line x1="24" y1="2" x2="24" y2="10" stroke="#94a3b8" strokeWidth="1.5" />
			<line
				x1="24"
				y1="38"
				x2="24"
				y2="46"
				stroke="#94a3b8"
				strokeWidth="1.5"
			/>
			<line x1="2" y1="24" x2="10" y2="24" stroke="#94a3b8" strokeWidth="1.5" />
			<line
				x1="38"
				y1="24"
				x2="46"
				y2="24"
				stroke="#94a3b8"
				strokeWidth="1.5"
			/>
		</svg>
	);
}

/**
 * Trajectory — тёмный «космос» с живыми canvas-симуляциями физики:
 * двойной маятник, баллистика с векторами, волны. Прогресс — как пульт
 * управления полётом к целевому баллу.
 */
export function TrajectoryLanding() {
	return (
		<div
			className="landing landing-trajectory light"
			data-testid="landing-page-trajectory"
			id="top"
		>
			<LandingNav
				activeVersion="trajectory"
				links={NAV}
				barClassName="border-sky-300/10 bg-[#050914]/90"
			/>

			{/* Hero */}
			<section className="landing-traj-grid relative isolate flex min-h-[100svh] items-center overflow-hidden pb-20 pt-28 sm:pt-24">
				<TrajectoryCanvas className="pointer-events-none absolute inset-0" />
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#050914_88%)]" />
				{HERO_FORMULAS.map((formula) => (
					<span
						key={formula.text}
						className={`landing-traj-float pointer-events-none absolute z-10 hidden font-mono text-sm text-sky-200/45 md:block ${formula.className}`}
						style={{ animationDelay: formula.delay }}
					>
						{formula.text}
					</span>
				))}
				<div className="relative z-20 mx-auto w-full max-w-6xl px-4 sm:px-6">
					<p className="landing-fade inline-block rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-sky-200 uppercase backdrop-blur-sm">
						{LANDING_BRAND} · онлайн-школа физики и математики
					</p>
					<h1 className="landing-fade landing-fade-delay-1 mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-6xl md:text-7xl">
						Твоя{" "}
						<span className="landing-traj-gradient-text landing-traj-glow">
							траектория
						</span>{" "}
						к высокому баллу уже просчитана
					</h1>
					<p className="landing-fade landing-fade-delay-2 mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
						Физика и математика — это движение по законам. Зададим начальную
						скорость, уберём трение страха — и доведём до цели по ЕГЭ или ОГЭ.
					</p>
					<div className="landing-fade landing-fade-delay-3 mt-9 flex flex-wrap items-center gap-4">
						<Button
							asChild
							size="lg"
							className="rounded-full bg-sky-400 px-8 font-semibold text-[#050914] shadow-lg shadow-sky-400/30 hover:bg-sky-300"
						>
							<a href="#trial" data-testid="landing-hero-cta">
								{LANDING_TRIAL.cta}
							</a>
						</Button>
						<Button
							asChild
							size="lg"
							variant="outline"
							className="rounded-full border-violet-300/30 bg-violet-300/10 px-8 text-violet-200 backdrop-blur-sm hover:bg-violet-300/20 hover:text-white"
						>
							<a href="#progress">Увидеть траекторию</a>
						</Button>
					</div>
					<div className="landing-fade landing-fade-delay-3 mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
						{LANDING_STATS.map((stat) => (
							<div
								key={stat.value}
								className="landing-traj-panel rounded-2xl border border-sky-300/15 bg-white/[0.03] p-4 backdrop-blur-sm"
							>
								<p className="font-display text-xl font-semibold text-sky-200">
									{stat.value}
								</p>
								<p className="mt-0.5 text-xs text-slate-400">{stat.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Formula marquee */}
			<div className="overflow-hidden border-y border-sky-300/10 bg-[#070d1d] py-3.5">
				<Marquee className="[--duration:36s] [--gap:3rem]">
					{FORMULAS.map((formula) => (
						<span
							key={formula}
							className="font-mono text-sm tracking-wide text-sky-200/60"
						>
							{formula}
							<span className="ml-12 text-violet-300/40" aria-hidden>
								✦
							</span>
						</span>
					))}
				</Marquee>
			</div>

			{/* Progress — пульт управления */}
			<section
				id="progress"
				className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
			>
				<div className="pointer-events-none absolute -left-40 top-24 size-96 rounded-full bg-sky-500/10 blur-[110px]" />
				<div className="pointer-events-none absolute -right-40 bottom-24 size-96 rounded-full bg-violet-500/10 blur-[110px]" />
				<div className="relative mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-traj-reveal text-sm font-semibold tracking-[0.2em] text-sky-300 uppercase">
						Пульт управления полётом
					</p>
					<h2 className="landing-traj-reveal mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
						Так выглядит прогресс ученика — и во что он превращается на экзамене
					</h2>
					<p className="landing-traj-reveal mt-4 max-w-2xl text-lg text-slate-300">
						{PROGRESS_OUTCOME.ege}, {PROGRESS_OUTCOME.oge} —{" "}
						{PROGRESS_OUTCOME.note}.
					</p>

					<div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
						<ScoreGraph />
						<div className="flex flex-col gap-4">
							<div className="landing-traj-panel grid grid-cols-3 gap-3 rounded-3xl border border-sky-300/15 bg-white/[0.03] p-5 text-center backdrop-blur-sm">
								<div>
									<p className="font-mono text-3xl font-semibold text-white sm:text-4xl">
										<CountUp value={34} />
									</p>
									<p className="mt-1 text-xs text-slate-400">старт</p>
								</div>
								<div>
									<p className="font-mono text-3xl font-semibold text-sky-300 sm:text-4xl">
										<CountUp value={42} prefix="+" />
									</p>
									<p className="mt-1 text-xs text-slate-400">за 4 месяца</p>
								</div>
								<div>
									<p className="font-mono text-3xl font-semibold text-amber-300 sm:text-4xl">
										<CountUp value={85} />
									</p>
									<p className="mt-1 text-xs text-slate-400">цель · ЕГЭ</p>
								</div>
							</div>
							<div className="flex flex-col gap-3">
								{PROGRESS_TOPICS.map((topic, i) => (
									<TopicBar key={topic.title} topic={topic} index={i} />
								))}
							</div>
						</div>
					</div>

					<div className="mt-12 grid gap-5 md:grid-cols-3">
						{PROGRESS_IMPACT.map((item, i) => (
							<article
								key={item.title}
								className="landing-traj-reveal landing-traj-card rounded-3xl border border-violet-300/15 bg-gradient-to-b from-violet-400/[0.07] to-transparent p-6"
								style={{ animationDelay: `${i * 140}ms` }}
							>
								<p className="font-mono text-sm text-violet-300">0{i + 1}</p>
								<h3 className="mt-3 font-display text-xl font-semibold text-white">
									{item.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-slate-300">
									{item.text}
								</p>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* Week rhythm */}
			<section
				id="week"
				className="scroll-mt-20 border-y border-sky-300/10 bg-[#070d1d] py-20 sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-traj-reveal text-sm font-semibold tracking-[0.2em] text-sky-300 uppercase">
						Механика недели
					</p>
					<h2 className="landing-traj-reveal mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
						Постоянная скорость важнее рывков
					</h2>
					<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{PROGRESS_WEEK.map((step, i) => (
							<article
								key={step.day}
								className="landing-traj-reveal landing-traj-card rounded-3xl border border-sky-300/15 bg-white/[0.03] p-6"
								style={{ animationDelay: `${i * 120}ms` }}
							>
								<WeekGlyph index={i} />
								<p className="mt-4 font-mono text-xs tracking-[0.25em] text-sky-300 uppercase">
									{step.day}
								</p>
								<h3 className="mt-1.5 font-display text-lg font-semibold text-white">
									{step.title}
								</h3>
								<p className="mt-1 text-sm text-slate-400">{step.text}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* Audience */}
			<section className="relative overflow-hidden py-20 sm:py-28">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-traj-reveal text-sm font-semibold tracking-[0.2em] text-sky-300 uppercase">
						Для кого
					</p>
					<h2 className="landing-traj-reveal mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
						Своя траектория для каждого старта
					</h2>
					<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{LANDING_AUDIENCE.map((item, i) => (
							<article
								key={item.title}
								className={`landing-traj-reveal landing-traj-card rounded-3xl border border-sky-300/15 bg-white/[0.03] p-6 ${
									i === 0 ? "lg:col-span-2" : ""
								}`}
								style={{ animationDelay: `${i * 100}ms` }}
							>
								<p className="font-display text-lg font-semibold text-sky-200">
									{item.title}
								</p>
								<p className="mt-2 text-sm leading-relaxed text-slate-300">
									{item.text}
								</p>
							</article>
						))}
						<div className="landing-traj-reveal flex items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 to-violet-500 p-7 text-center">
							<p className="font-display text-xl font-semibold text-white">
								Найдём твою траекторию →
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Formats */}
			<section
				id="formats"
				className="scroll-mt-20 border-y border-sky-300/10 bg-[#070d1d] py-20 sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-traj-reveal text-sm font-semibold tracking-[0.2em] text-sky-300 uppercase">
						Форматы
					</p>
					<h2 className="landing-traj-reveal mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
						Выбери режим полёта
					</h2>
					<div className="mt-14 grid gap-6 lg:grid-cols-3">
						{LANDING_FORMATS.map((format, i) => (
							<article
								key={format.id}
								id={format.id}
								className={`landing-traj-reveal landing-traj-card flex flex-col rounded-3xl border p-7 ${
									format.featured
										? "border-sky-300/50 bg-sky-400/[0.06] ring-1 ring-sky-300/25"
										: "border-sky-300/15 bg-white/[0.03]"
								}`}
								style={{ animationDelay: `${i * 130}ms` }}
							>
								{format.featured ? (
									<p className="mb-3 self-start rounded-full bg-sky-400 px-3 py-1 text-xs font-bold text-[#050914]">
										Популярный
									</p>
								) : null}
								<h3 className="font-display text-2xl font-semibold text-white">
									{format.title}
								</h3>
								<p className="mt-3 font-display text-3xl font-semibold text-sky-300">
									{format.highlight}
								</p>
								<p className="mt-1 text-sm text-slate-400">
									{format.highlightHint}
								</p>
								<p className="mt-4 text-sm leading-relaxed text-slate-300">
									{format.lead}
								</p>
								<div className="mt-6 border-t border-dashed border-sky-300/15 pt-5">
									<ul className="space-y-2 text-sm text-slate-200">
										{format.points.map((point) => (
											<li key={point} className="flex gap-2">
												<span aria-hidden className="text-sky-300">
													✓
												</span>
												{point}
											</li>
										))}
									</ul>
								</div>
								<div className="mt-auto pt-6">
									<Button
										asChild
										className={`w-full rounded-full ${
											format.featured
												? "bg-sky-400 font-semibold text-[#050914] hover:bg-sky-300"
												: "bg-white/10 text-white hover:bg-white/20"
										}`}
									>
										<a href="#trial">{format.cta}</a>
									</Button>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* Reviews */}
			<section id="reviews" className="scroll-mt-20 py-20 sm:py-28">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-traj-reveal text-sm font-semibold tracking-[0.2em] text-sky-300 uppercase">
						Отзывы
					</p>
					<h2 className="landing-traj-reveal mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
						Телеметрия с борта
					</h2>
				</div>
				<div className="relative mt-12">
					<Marquee pauseOnHover className="[--duration:50s] [--gap:1.25rem]">
						{LANDING_REVIEWS.filter((_, i) => i % 2 === 0).map((review) => (
							<ReviewCard
								key={review.id}
								review={review}
								className="border-sky-300/15 bg-white/[0.04] backdrop-blur-sm [&_blockquote]:text-slate-200 [&_figcaption]:border-sky-300/10 [&_figcaption_p:first-child]:text-white [&_figcaption_p:last-child]:text-slate-400"
							/>
						))}
					</Marquee>
					<Marquee
						reverse
						pauseOnHover
						className="mt-4 [--duration:50s] [--gap:1.25rem]"
					>
						{LANDING_REVIEWS.filter((_, i) => i % 2 === 1).map((review) => (
							<ReviewCard
								key={review.id}
								review={review}
								className="border-sky-300/15 bg-white/[0.04] backdrop-blur-sm [&_blockquote]:text-slate-200 [&_figcaption]:border-sky-300/10 [&_figcaption_p:first-child]:text-white [&_figcaption_p:last-child]:text-slate-400"
							/>
						))}
					</Marquee>
				</div>
			</section>

			{/* FAQ */}
			<section
				id="faq"
				className="scroll-mt-20 border-y border-sky-300/10 bg-[#070d1d] py-20 sm:py-28"
			>
				<div className="mx-auto max-w-3xl px-4 sm:px-6">
					<p className="landing-traj-reveal text-sm font-semibold tracking-[0.2em] text-sky-300 uppercase">
						Вопросы
					</p>
					<h2 className="landing-traj-reveal mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
						Частые вопросы
					</h2>
					<Accordion type="single" collapsible className="mt-10 w-full">
						{LANDING_FAQ.map((item) => (
							<AccordionItem
								key={item.q}
								value={item.q}
								className="border-sky-300/10"
							>
								<AccordionTrigger className="text-left text-base font-medium text-slate-100 hover:text-sky-300">
									{item.q}
								</AccordionTrigger>
								<AccordionContent className="text-slate-300">
									{item.a}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</section>

			{/* Trial CTA */}
			<section
				id="trial"
				className="relative scroll-mt-20 overflow-hidden py-24 text-center sm:py-32"
			>
				<div className="pointer-events-none absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[130px]" />
				<div className="relative mx-auto max-w-2xl px-4">
					<p className="landing-traj-reveal font-mono text-sm text-sky-300">
						t = 0 · старт двигателей
					</p>
					<h2 className="landing-traj-reveal mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
						{LANDING_TRIAL.title}
					</h2>
					<p className="landing-traj-reveal mx-auto mt-5 max-w-lg text-lg text-slate-300">
						{LANDING_TRIAL.body}
					</p>
					<Button
						asChild
						size="lg"
						className="landing-traj-reveal mt-10 rounded-full bg-sky-400 px-10 font-semibold text-[#050914] shadow-xl shadow-sky-400/30 hover:bg-sky-300"
					>
						<a
							href={LANDING_TRIAL.href}
							target="_blank"
							rel="noreferrer"
							data-testid="landing-trial-cta"
						>
							{LANDING_TRIAL.cta} → Telegram
						</a>
					</Button>
				</div>
			</section>

			<LandingFooter
				testIdPrefix="landing-trajectory"
				className="border-sky-300/10 bg-[#04070f] text-white [--pm-amber:#7dd3fc] [--pm-amber-bright:#bae6fd] [--pm-navy:#050914]"
			/>
		</div>
	);
}

export default TrajectoryLanding;
