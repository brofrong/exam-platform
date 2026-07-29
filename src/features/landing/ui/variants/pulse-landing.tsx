import {
	MotionConfig,
	motion,
	useInView,
	useMotionValue,
	useScroll,
	useSpring,
	useTransform,
} from "framer-motion";
import { type ReactNode, useEffect, useRef } from "react";
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
	"a = Δv / Δt",
	"a² + b² = c²",
	"sin²α + cos²α = 1",
	"x = −b ± √D / 2a",
	"∫ f(x) dx",
	"Ek = mv² / 2",
	"W = F·s",
	"y = sin ωt",
] as const;

const HEADLINE_WORDS = ["Балл", "растёт", "по", "законам", "физики:"] as const;

const GRAPH_POINTS = [
	{ x: 40, y: 198 },
	{ x: 150, y: 163 },
	{ x: 260, y: 128 },
	{ x: 370, y: 102 },
	{ x: 480, y: 64 },
	{ x: 590, y: 36 },
] as const;

const GRAPH_PATH =
	"M 40 198 C 85 190 105 177 150 163 C 195 149 215 139 260 128 C 305 117 325 110 370 102 C 415 94 435 77 480 64 C 525 51 545 42 590 36";

function Reveal({
	children,
	delay = 0,
	className,
}: {
	children: ReactNode;
	delay?: number;
	className?: string;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 36 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-60px" }}
			transition={{ type: "spring", stiffness: 64, damping: 17, delay }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

function TiltCard({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const rotateX = useMotionValue(0);
	const rotateY = useMotionValue(0);
	const springX = useSpring(rotateX, { stiffness: 160, damping: 18 });
	const springY = useSpring(rotateY, { stiffness: 160, damping: 18 });

	return (
		<motion.div
			ref={ref}
			onMouseMove={(event) => {
				const rect = ref.current?.getBoundingClientRect();
				if (!rect) {
					return;
				}
				const px = (event.clientX - rect.left) / rect.width - 0.5;
				const py = (event.clientY - rect.top) / rect.height - 0.5;
				rotateY.set(px * 16);
				rotateX.set(-py * 16);
			}}
			onMouseLeave={() => {
				rotateX.set(0);
				rotateY.set(0);
			}}
			style={{
				rotateX: springX,
				rotateY: springY,
				transformPerspective: 900,
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

function SpringNumber({
	value,
	prefix = "",
	suffix = "",
}: {
	value: number;
	prefix?: string;
	suffix?: string;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, margin: "-40px" });
	const spring = useSpring(0, { stiffness: 52, damping: 15 });
	const text = useTransform(
		spring,
		(v) => `${prefix}${Math.round(v)}${suffix}`,
	);

	useEffect(() => {
		if (inView) {
			spring.set(value);
		}
	}, [inView, value, spring]);

	return <motion.span ref={ref}>{text}</motion.span>;
}

function ScrollGraph() {
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start 0.85", "end 0.45"],
	});
	const pathLength = useSpring(scrollYProgress, {
		stiffness: 90,
		damping: 26,
	});
	const areaOpacity = useTransform(scrollYProgress, [0.6, 1], [0, 1]);

	return (
		<div
			ref={ref}
			className="relative overflow-hidden rounded-3xl border border-violet-300/15 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-7"
		>
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<p className="text-sm font-semibold tracking-[0.2em] text-violet-300 uppercase">
					Кривая роста · скролль — и график достроится
				</p>
				<p className="font-mono text-xs text-slate-400">ЕГЭ · 100 баллов</p>
			</div>
			<svg
				viewBox="0 0 640 240"
				className="mt-5 w-full"
				role="img"
				aria-label="График роста балла: с 34 на диагностике до цели 85 на ЕГЭ"
			>
				<defs>
					<linearGradient id="pulse-area" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
						<stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
					</linearGradient>
				</defs>
				{[56, 106, 156].map((y) => (
					<line
						key={y}
						x1="40"
						x2="600"
						y1={y}
						y2={y}
						stroke="rgba(148, 163, 184, 0.13)"
						strokeDasharray="3 7"
					/>
				))}
				<line
					x1="40"
					x2="600"
					y1="36"
					y2="36"
					stroke="rgba(252, 211, 77, 0.4)"
					strokeDasharray="8 8"
				/>
				<motion.path
					d={`${GRAPH_PATH} L 590 230 L 40 230 Z`}
					fill="url(#pulse-area)"
					style={{ opacity: areaOpacity }}
				/>
				<motion.path
					d={GRAPH_PATH}
					fill="none"
					stroke="#a78bfa"
					strokeWidth="3"
					strokeLinecap="round"
					style={{ pathLength }}
				/>
				{GRAPH_POINTS.map((point, i) => {
					const checkpoint = PROGRESS_SCORE_PATH[i];
					const last = i === GRAPH_POINTS.length - 1;
					return (
						<g key={checkpoint.label}>
							<motion.circle
								cx={point.x}
								cy={point.y}
								r={last ? 7 : 5}
								fill={last ? "#fcd34d" : "#0a0918"}
								stroke={last ? "#fcd34d" : "#a78bfa"}
								strokeWidth="2.5"
								initial={{ scale: 0, opacity: 0 }}
								whileInView={{ scale: 1, opacity: 1 }}
								viewport={{ once: true }}
								transition={{
									type: "spring",
									stiffness: 260,
									damping: 14,
									delay: 0.25 + i * 0.16,
								}}
								style={{ transformOrigin: `${point.x}px ${point.y}px` }}
							/>
							<text
								x={point.x}
								y={point.y - 15}
								textAnchor="middle"
								className="fill-slate-100 font-mono text-[15px] font-semibold"
							>
								{checkpoint.score}
							</text>
							<text
								x={point.x}
								y="232"
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
				Каждая точка — пробник на платформе:{" "}
				<span className="text-violet-300">+42 балла за 4 месяца</span> — это
				ускорение, а не удача.
			</p>
		</div>
	);
}

function TopicRow({
	topic,
	index,
}: {
	topic: (typeof PROGRESS_TOPICS)[number];
	index: number;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, x: -28 }}
			whileInView={{ opacity: 1, x: 0 }}
			viewport={{ once: true, margin: "-40px" }}
			transition={{
				type: "spring",
				stiffness: 80,
				damping: 16,
				delay: index * 0.09,
			}}
			className="rounded-2xl border border-violet-300/15 bg-white/[0.04] p-4 backdrop-blur-sm"
		>
			<div className="flex items-baseline justify-between gap-3">
				<p className="font-medium text-slate-100">{topic.title}</p>
				<p className="shrink-0 font-mono text-sm text-amber-300">
					{topic.points}
				</p>
			</div>
			<p className="mt-0.5 font-mono text-xs text-slate-400">{topic.exam}</p>
			<div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-400/15">
				<motion.div
					className="h-full origin-left rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
					initial={{ scaleX: 0 }}
					whileInView={{ scaleX: topic.percent / 100 }}
					viewport={{ once: true, margin: "-40px" }}
					transition={{
						type: "spring",
						stiffness: 46,
						damping: 15,
						delay: 0.15 + index * 0.09,
					}}
				/>
			</div>
			<p className="mt-1.5 text-right font-mono text-xs text-violet-300">
				{topic.percent}% освоено
			</p>
		</motion.div>
	);
}

function WeekGlyph({ index }: { index: number }) {
	if (index === 0) {
		return (
			<svg viewBox="0 0 48 48" className="size-12" aria-hidden fill="none">
				<title>Орбита</title>
				<circle cx="24" cy="24" r="6" fill="#fcd34d" />
				<motion.g
					style={{ transformOrigin: "24px 24px" }}
					animate={{ rotate: 360 }}
					transition={{
						duration: 9,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
				>
					<ellipse
						cx="24"
						cy="24"
						rx="19"
						ry="9"
						stroke="#a78bfa"
						strokeWidth="1.5"
						transform="rotate(-20 24 24)"
					/>
					<circle cx="41" cy="17" r="3" fill="#67e8f9" />
				</motion.g>
			</svg>
		);
	}
	if (index === 1) {
		return (
			<svg viewBox="0 0 48 48" className="size-12" aria-hidden fill="none">
				<title>Маятник</title>
				<circle cx="24" cy="6" r="2.5" fill="#94a3b8" />
				<motion.g
					style={{ transformOrigin: "24px 6px" }}
					animate={{ rotate: [26, -26, 26] }}
					transition={{
						duration: 2.4,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				>
					<line
						x1="24"
						y1="6"
						x2="24"
						y2="32"
						stroke="#e2e8f0"
						strokeWidth="1.6"
					/>
					<circle cx="24" cy="36" r="6" fill="#a78bfa" />
				</motion.g>
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
				<motion.path
					d="M 4 24 Q 12 10, 20 24 T 36 24 T 52 24"
					stroke="#67e8f9"
					strokeWidth="2"
					strokeLinecap="round"
					animate={{ y: [0, -4, 0, 4, 0] }}
					transition={{
						duration: 3.2,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>
				<path
					d="M 4 32 Q 12 22, 20 32 T 36 32 T 52 32"
					stroke="#a78bfa"
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
			<circle cx="24" cy="24" r="9" stroke="#a78bfa" strokeWidth="1.5" />
			<motion.circle
				cx="24"
				cy="24"
				r="3.5"
				fill="#fcd34d"
				animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
				transition={{
					duration: 1.8,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
				style={{ transformOrigin: "24px 24px" }}
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

function HeroFormulaCard() {
	return (
		<TiltCard className="relative mx-auto w-full max-w-sm">
			<div className="relative overflow-hidden rounded-[2rem] border border-violet-300/25 bg-gradient-to-b from-violet-400/[0.12] to-fuchsia-400/[0.06] p-7 shadow-2xl shadow-violet-500/20 backdrop-blur-md">
				<p className="font-mono text-xs tracking-[0.25em] text-violet-300 uppercase">
					второй закон прогресса
				</p>
				<p className="mt-5 font-display text-4xl font-semibold text-white">
					a = Δv / Δt
				</p>
				<p className="mt-3 text-sm leading-relaxed text-slate-300">
					Ускорение — это изменение скорости со временем. Регулярные уроки дают
					постоянное ускорение:{" "}
					<span className="text-violet-300">+10 баллов в месяц</span> — и через
					четверть ты на другой орбите.
				</p>
				<div className="mt-6 flex items-end justify-between border-t border-violet-300/15 pt-4">
					<div>
						<p className="font-mono text-3xl font-semibold text-fuchsia-300">
							v = v₀ + at
						</p>
						<p className="mt-1 text-xs text-slate-400">
							скорость сегодня — не приговор
						</p>
					</div>
					<motion.div
						animate={{ rotate: 360 }}
						transition={{
							duration: 14,
							repeat: Number.POSITIVE_INFINITY,
							ease: "linear",
						}}
						className="size-12 rounded-full border border-dashed border-violet-300/40"
					/>
				</div>
			</div>
		</TiltCard>
	);
}

/**
 * Pulse — framer-motion вариант: spring-входы, 3D-tilt карточки,
 * параллакс-орбы и график балла, достраивающийся от скролла.
 */
export function PulseLanding() {
	const heroRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress: heroProgress } = useScroll({
		target: heroRef,
		offset: ["start start", "end start"],
	});
	const orbY1 = useTransform(heroProgress, [0, 1], [0, -140]);
	const orbY2 = useTransform(heroProgress, [0, 1], [0, 140]);
	const orbY3 = useTransform(heroProgress, [0, 1], [0, -80]);
	const heroFade = useTransform(heroProgress, [0, 0.8], [1, 0]);

	return (
		<MotionConfig reducedMotion="user">
			<div
				className="landing landing-pulse light"
				data-testid="landing-page-pulse"
				id="top"
			>
				<LandingNav
					activeVersion="pulse"
					links={NAV}
					barClassName="border-violet-300/10 bg-[#0a0918]/90"
				/>

				{/* Hero */}
				<section
					ref={heroRef}
					className="landing-pulse-grid relative isolate flex min-h-[100svh] items-center overflow-hidden pb-20 pt-28 sm:pt-24"
				>
					<motion.div
						style={{ y: orbY1 }}
						className="pointer-events-none absolute -left-32 top-16 size-96 rounded-full bg-violet-600/25 blur-[110px]"
					/>
					<motion.div
						style={{ y: orbY2 }}
						className="pointer-events-none absolute -right-24 top-1/3 size-80 rounded-full bg-fuchsia-600/20 blur-[110px]"
					/>
					<motion.div
						style={{ y: orbY3 }}
						className="pointer-events-none absolute bottom-[-6rem] left-1/3 size-72 rounded-full bg-cyan-500/15 blur-[100px]"
					/>
					{FORMULAS.slice(0, 4).map((formula, i) => (
						<motion.span
							key={formula}
							initial={{ opacity: 0 }}
							animate={{
								opacity: 1,
								y: [0, -12, 0],
								rotate: [
									i % 2 === 0 ? -3 : 3,
									i % 2 === 0 ? 3 : -3,
									i % 2 === 0 ? -3 : 3,
								],
							}}
							transition={{
								opacity: { delay: 1 + i * 0.3, duration: 0.8 },
								y: {
									duration: 6 + i,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								},
								rotate: {
									duration: 6 + i,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								},
							}}
							className={`pointer-events-none absolute z-10 hidden font-mono text-sm text-violet-200/50 md:block ${
								i === 0
									? "left-[6%] top-[20%]"
									: i === 1
										? "right-[8%] top-[18%]"
										: i === 2
											? "left-[10%] bottom-[22%]"
											: "right-[6%] bottom-[26%]"
							}`}
						>
							{formula}
						</motion.span>
					))}
					<motion.div
						style={{ opacity: heroFade }}
						className="relative z-20 mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]"
					>
						<div>
							<motion.p
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ type: "spring", stiffness: 90, damping: 16 }}
								className="inline-block rounded-full border border-violet-300/25 bg-violet-300/10 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-violet-200 uppercase backdrop-blur-sm"
							>
								{LANDING_BRAND} · физика твоего прогресса
							</motion.p>
							<h1 className="mt-6 font-display text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-6xl md:text-7xl">
								{HEADLINE_WORDS.map((word, i) => (
									<motion.span
										key={word}
										className="inline-block"
										initial={{ opacity: 0, y: 44, rotate: 6 }}
										animate={{ opacity: 1, y: 0, rotate: 0 }}
										transition={{
											type: "spring",
											stiffness: 110,
											damping: 15,
											delay: 0.15 + i * 0.09,
										}}
									>
										{word}
										{"\u00A0"}
									</motion.span>
								))}
								<motion.span
									className="landing-pulse-gradient-text inline-block"
									initial={{ opacity: 0, scale: 0.7 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{
										type: "spring",
										stiffness: 120,
										damping: 12,
										delay: 0.15 + HEADLINE_WORDS.length * 0.09,
									}}
								>
									ускоряем
								</motion.span>
							</h1>
							<motion.p
								initial={{ opacity: 0, y: 24 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									type: "spring",
									stiffness: 70,
									damping: 16,
									delay: 0.7,
								}}
								className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300"
							>
								ЕГЭ и ОГЭ по математике и физике — без инерции страха. Каждая
								неделя — измеримый импульс: темы, пробники и балл, который видно
								на графике.
							</motion.p>
							<motion.div
								initial={{ opacity: 0, y: 24 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									type: "spring",
									stiffness: 70,
									damping: 16,
									delay: 0.85,
								}}
								className="mt-9 flex flex-wrap items-center gap-4"
							>
								<Button
									asChild
									size="lg"
									className="rounded-full bg-violet-400 px-8 font-semibold text-[#0a0918] shadow-lg shadow-violet-400/30 hover:bg-violet-300"
								>
									<a href="#trial" data-testid="landing-hero-cta">
										{LANDING_TRIAL.cta}
									</a>
								</Button>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="rounded-full border-fuchsia-300/30 bg-fuchsia-300/10 px-8 text-fuchsia-200 backdrop-blur-sm hover:bg-fuchsia-300/20 hover:text-white"
								>
									<a href="#progress">Смотреть кривую</a>
								</Button>
							</motion.div>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 1.05, duration: 0.7 }}
								className="mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4"
							>
								{LANDING_STATS.map((stat, i) => (
									<motion.div
										key={stat.value}
										initial={{ opacity: 0, y: 24 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											type: "spring",
											stiffness: 90,
											damping: 15,
											delay: 1.05 + i * 0.1,
										}}
										className="rounded-2xl border border-violet-300/15 bg-white/[0.04] p-4 backdrop-blur-sm"
									>
										<p className="font-display text-xl font-semibold text-violet-200">
											{stat.value}
										</p>
										<p className="mt-0.5 text-xs text-slate-400">
											{stat.label}
										</p>
									</motion.div>
								))}
							</motion.div>
						</div>
						<motion.div
							initial={{ opacity: 0, y: 60, rotate: -4 }}
							animate={{ opacity: 1, y: 0, rotate: 0 }}
							transition={{
								type: "spring",
								stiffness: 55,
								damping: 15,
								delay: 0.5,
							}}
						>
							<HeroFormulaCard />
						</motion.div>
					</motion.div>
				</section>

				{/* Formula marquee */}
				<div className="overflow-hidden border-y border-violet-300/10 bg-[#0d0b21] py-3.5">
					<Marquee className="[--duration:32s] [--gap:3rem]">
						{FORMULAS.map((formula) => (
							<span
								key={formula}
								className="font-mono text-sm tracking-wide text-violet-200/60"
							>
								{formula}
								<span className="ml-12 text-fuchsia-300/40" aria-hidden>
									∿
								</span>
							</span>
						))}
					</Marquee>
				</div>

				{/* Progress */}
				<section
					id="progress"
					className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
				>
					<div className="pointer-events-none absolute -left-40 top-24 size-96 rounded-full bg-violet-600/15 blur-[110px]" />
					<div className="pointer-events-none absolute -right-40 bottom-24 size-96 rounded-full bg-cyan-500/10 blur-[110px]" />
					<div className="relative mx-auto max-w-6xl px-4 sm:px-6">
						<Reveal>
							<p className="text-sm font-semibold tracking-[0.2em] text-violet-300 uppercase">
								Динамика прогресса
							</p>
						</Reveal>
						<Reveal delay={0.08}>
							<h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
								Кривая балла — и сила, которая её толкает вверх
							</h2>
						</Reveal>
						<Reveal delay={0.16}>
							<p className="mt-4 max-w-2xl text-lg text-slate-300">
								{PROGRESS_OUTCOME.ege}, {PROGRESS_OUTCOME.oge} —{" "}
								{PROGRESS_OUTCOME.note}.
							</p>
						</Reveal>
						<div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
							<Reveal delay={0.1}>
								<ScrollGraph />
							</Reveal>
							<div className="flex flex-col gap-4">
								<Reveal delay={0.18}>
									<div className="grid grid-cols-3 gap-3 rounded-3xl border border-violet-300/15 bg-white/[0.04] p-5 text-center backdrop-blur-sm">
										<div>
											<p className="font-mono text-3xl font-semibold text-white sm:text-4xl">
												<SpringNumber value={34} />
											</p>
											<p className="mt-1 text-xs text-slate-400">старт</p>
										</div>
										<div>
											<p className="font-mono text-3xl font-semibold text-fuchsia-300 sm:text-4xl">
												<SpringNumber value={42} prefix="+" />
											</p>
											<p className="mt-1 text-xs text-slate-400">за 4 месяца</p>
										</div>
										<div>
											<p className="font-mono text-3xl font-semibold text-amber-300 sm:text-4xl">
												<SpringNumber value={85} />
											</p>
											<p className="mt-1 text-xs text-slate-400">цель · ЕГЭ</p>
										</div>
									</div>
								</Reveal>
								<div className="flex flex-col gap-3">
									{PROGRESS_TOPICS.map((topic, i) => (
										<TopicRow key={topic.title} topic={topic} index={i} />
									))}
								</div>
							</div>
						</div>
						<div className="mt-12 grid gap-5 md:grid-cols-3">
							{PROGRESS_IMPACT.map((item, i) => (
								<Reveal key={item.title} delay={i * 0.12}>
									<TiltCard className="h-full">
										<article className="h-full rounded-3xl border border-fuchsia-300/15 bg-gradient-to-b from-fuchsia-400/[0.08] to-transparent p-6">
											<p className="font-mono text-sm text-fuchsia-300">
												F{i + 1} →
											</p>
											<h3 className="mt-3 font-display text-xl font-semibold text-white">
												{item.title}
											</h3>
											<p className="mt-2 text-sm leading-relaxed text-slate-300">
												{item.text}
											</p>
										</article>
									</TiltCard>
								</Reveal>
							))}
						</div>
					</div>
				</section>

				{/* Week */}
				<section
					id="week"
					className="scroll-mt-20 border-y border-violet-300/10 bg-[#0d0b21] py-20 sm:py-28"
				>
					<div className="mx-auto max-w-6xl px-4 sm:px-6">
						<Reveal>
							<p className="text-sm font-semibold tracking-[0.2em] text-violet-300 uppercase">
								Периодические колебания
							</p>
						</Reveal>
						<Reveal delay={0.08}>
							<h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
								Неделя ученика — устойчивая частота
							</h2>
						</Reveal>
						<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
							{PROGRESS_WEEK.map((step, i) => (
								<Reveal key={step.day} delay={i * 0.1}>
									<motion.article
										whileHover={{
											y: -8,
											transition: {
												type: "spring",
												stiffness: 300,
												damping: 18,
											},
										}}
										className="h-full rounded-3xl border border-violet-300/15 bg-white/[0.04] p-6"
									>
										<WeekGlyph index={i} />
										<p className="mt-4 font-mono text-xs tracking-[0.25em] text-violet-300 uppercase">
											{step.day}
										</p>
										<h3 className="mt-1.5 font-display text-lg font-semibold text-white">
											{step.title}
										</h3>
										<p className="mt-1 text-sm text-slate-400">{step.text}</p>
									</motion.article>
								</Reveal>
							))}
						</div>
					</div>
				</section>

				{/* Audience */}
				<section className="relative overflow-hidden py-20 sm:py-28">
					<div className="mx-auto max-w-6xl px-4 sm:px-6">
						<Reveal>
							<p className="text-sm font-semibold tracking-[0.2em] text-violet-300 uppercase">
								Для кого
							</p>
						</Reveal>
						<Reveal delay={0.08}>
							<h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
								Начальные условия любые — система одна
							</h2>
						</Reveal>
						<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
							{LANDING_AUDIENCE.map((item, i) => (
								<Reveal
									key={item.title}
									delay={i * 0.08}
									className={i === 0 ? "lg:col-span-2" : undefined}
								>
									<motion.article
										whileHover={{ y: -6 }}
										transition={{ type: "spring", stiffness: 300, damping: 20 }}
										className="h-full rounded-3xl border border-violet-300/15 bg-white/[0.04] p-6"
									>
										<p className="font-display text-lg font-semibold text-violet-200">
											{item.title}
										</p>
										<p className="mt-2 text-sm leading-relaxed text-slate-300">
											{item.text}
										</p>
									</motion.article>
								</Reveal>
							))}
							<Reveal delay={0.4}>
								<div className="flex h-full items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-7 text-center">
									<p className="font-display text-xl font-semibold text-white">
										Подставим твои условия →
									</p>
								</div>
							</Reveal>
						</div>
					</div>
				</section>

				{/* Formats */}
				<section
					id="formats"
					className="scroll-mt-20 border-y border-violet-300/10 bg-[#0d0b21] py-20 sm:py-28"
				>
					<div className="mx-auto max-w-6xl px-4 sm:px-6">
						<Reveal>
							<p className="text-sm font-semibold tracking-[0.2em] text-violet-300 uppercase">
								Форматы
							</p>
						</Reveal>
						<Reveal delay={0.08}>
							<h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
								Три режима ускорения
							</h2>
						</Reveal>
						<div className="mt-14 grid gap-6 lg:grid-cols-3">
							{LANDING_FORMATS.map((format, i) => (
								<Reveal key={format.id} delay={i * 0.12} className="h-full">
									<motion.article
										id={format.id}
										whileHover={{ y: -8 }}
										transition={{ type: "spring", stiffness: 280, damping: 18 }}
										className={`flex h-full flex-col rounded-3xl border p-7 ${
											format.featured
												? "border-violet-300/50 bg-violet-400/[0.07] ring-1 ring-violet-300/25"
												: "border-violet-300/15 bg-white/[0.04]"
										}`}
									>
										{format.featured ? (
											<p className="mb-3 self-start rounded-full bg-violet-400 px-3 py-1 text-xs font-bold text-[#0a0918]">
												Популярный
											</p>
										) : null}
										<h3 className="font-display text-2xl font-semibold text-white">
											{format.title}
										</h3>
										<p className="mt-3 font-display text-3xl font-semibold text-fuchsia-300">
											{format.highlight}
										</p>
										<p className="mt-1 text-sm text-slate-400">
											{format.highlightHint}
										</p>
										<p className="mt-4 text-sm leading-relaxed text-slate-300">
											{format.lead}
										</p>
										<div className="mt-6 border-t border-dashed border-violet-300/15 pt-5">
											<ul className="space-y-2 text-sm text-slate-200">
												{format.points.map((point) => (
													<li key={point} className="flex gap-2">
														<span aria-hidden className="text-violet-300">
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
														? "bg-violet-400 font-semibold text-[#0a0918] hover:bg-violet-300"
														: "bg-white/10 text-white hover:bg-white/20"
												}`}
											>
												<a href="#trial">{format.cta}</a>
											</Button>
										</div>
									</motion.article>
								</Reveal>
							))}
						</div>
					</div>
				</section>

				{/* Reviews */}
				<section id="reviews" className="scroll-mt-20 py-20 sm:py-28">
					<div className="mx-auto max-w-6xl px-4 sm:px-6">
						<Reveal>
							<p className="text-sm font-semibold tracking-[0.2em] text-violet-300 uppercase">
								Отзывы
							</p>
						</Reveal>
						<Reveal delay={0.08}>
							<h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
								Резонанс от учеников
							</h2>
						</Reveal>
					</div>
					<div className="relative mt-12">
						<Marquee pauseOnHover className="[--duration:50s] [--gap:1.25rem]">
							{LANDING_REVIEWS.filter((_, i) => i % 2 === 0).map((review) => (
								<ReviewCard
									key={review.id}
									review={review}
									className="border-violet-300/15 bg-white/[0.05] backdrop-blur-sm [&_blockquote]:text-slate-200 [&_figcaption]:border-violet-300/10 [&_figcaption_p:first-child]:text-white [&_figcaption_p:last-child]:text-slate-400"
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
									className="border-violet-300/15 bg-white/[0.05] backdrop-blur-sm [&_blockquote]:text-slate-200 [&_figcaption]:border-violet-300/10 [&_figcaption_p:first-child]:text-white [&_figcaption_p:last-child]:text-slate-400"
								/>
							))}
						</Marquee>
					</div>
				</section>

				{/* FAQ */}
				<section
					id="faq"
					className="scroll-mt-20 border-y border-violet-300/10 bg-[#0d0b21] py-20 sm:py-28"
				>
					<div className="mx-auto max-w-3xl px-4 sm:px-6">
						<Reveal>
							<p className="text-sm font-semibold tracking-[0.2em] text-violet-300 uppercase">
								Вопросы
							</p>
						</Reveal>
						<Reveal delay={0.08}>
							<h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
								Частые вопросы
							</h2>
						</Reveal>
						<Reveal delay={0.16}>
							<Accordion type="single" collapsible className="mt-10 w-full">
								{LANDING_FAQ.map((item) => (
									<AccordionItem
										key={item.q}
										value={item.q}
										className="border-violet-300/10"
									>
										<AccordionTrigger className="text-left text-base font-medium text-slate-100 hover:text-violet-300">
											{item.q}
										</AccordionTrigger>
										<AccordionContent className="text-slate-300">
											{item.a}
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</Reveal>
					</div>
				</section>

				{/* Trial CTA */}
				<section
					id="trial"
					className="relative scroll-mt-20 overflow-hidden py-24 text-center sm:py-32"
				>
					<motion.div
						animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
						transition={{
							duration: 5,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
						className="pointer-events-none absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[120px]"
					/>
					<div className="relative mx-auto max-w-2xl px-4">
						<Reveal>
							<p className="font-mono text-sm text-violet-300">
								F = ma — придай себе ускорение
							</p>
						</Reveal>
						<Reveal delay={0.08}>
							<h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
								{LANDING_TRIAL.title}
							</h2>
						</Reveal>
						<Reveal delay={0.16}>
							<p className="mx-auto mt-5 max-w-lg text-lg text-slate-300">
								{LANDING_TRIAL.body}
							</p>
						</Reveal>
						<Reveal delay={0.24}>
							<Button
								asChild
								size="lg"
								className="mt-10 rounded-full bg-violet-400 px-10 font-semibold text-[#0a0918] shadow-xl shadow-violet-400/30 hover:bg-violet-300"
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
						</Reveal>
					</div>
				</section>

				<LandingFooter
					testIdPrefix="landing-pulse"
					className="border-violet-300/10 bg-[#070613] text-white [--pm-amber:#a78bfa] [--pm-amber-bright:#c4b5fd] [--pm-navy:#0a0918]"
				/>
			</div>
		</MotionConfig>
	);
}

export default PulseLanding;
