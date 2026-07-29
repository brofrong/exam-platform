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
	{ href: "#progress", label: "Дневник прогресса" },
	{ href: "#week", label: "Расписание" },
	{ href: "#formats", label: "Форматы" },
	{ href: "#reviews", label: "Отзывы" },
	{ href: "#faq", label: "Вопросы" },
] as const;

const INK = "#26324d";
const BLUE = "#2f5fd0";
const RED = "#d6453c";
const GREEN = "#3d8f60";

const HERO_FORMULAS = [
	{
		text: "x = (−b ± √D) / 2a",
		className: "left-[4%] top-[16%] -rotate-6",
		delay: "0.9s",
	},
	{
		text: "a² + b² = c²",
		className: "right-[5%] top-[22%] rotate-3",
		delay: "1.5s",
	},
	{
		text: "F = ma",
		className: "left-[7%] bottom-[24%] rotate-2",
		delay: "2.1s",
	},
	{
		text: "sin²α + cos²α = 1",
		className: "right-[8%] bottom-[28%] -rotate-3",
		delay: "2.7s",
	},
	{
		text: "ΔV / Δt → a",
		className: "left-[42%] top-[10%] rotate-1",
		delay: "3.3s",
	},
] as const;

const MARGIN_NOTES = [
	"проверено!",
	"красота",
	"+ баллы",
	"не забыть!",
	"важно",
	"умничка",
] as const;

/** Точки графика балла (viewBox 640×270) = PROGRESS_SCORE_PATH */
const NB_POINTS = [
	{ x: 52, y: 208 },
	{ x: 154, y: 172 },
	{ x: 256, y: 136 },
	{ x: 358, y: 109 },
	{ x: 460, y: 69 },
	{ x: 578, y: 39 },
] as const;

const NB_PATH =
	"M 52 208 C 96 200 112 186 154 172 C 196 158 214 147 256 136 C 298 125 316 117 358 109 C 400 101 418 82 460 69 C 502 56 534 45 578 39";

function Squiggle({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 200 12"
			className={className}
			aria-hidden
			fill="none"
			preserveAspectRatio="none"
		>
			<title>Рукописное подчёркивание</title>
			<path
				d="M 2 8 Q 25 2, 50 7 T 100 7 T 150 7 T 198 6"
				stroke={RED}
				strokeWidth="3"
				strokeLinecap="round"
				pathLength={1}
				className="landing-nb-draw-hero"
			/>
		</svg>
	);
}

function PlotBoard() {
	return (
		<div className="landing-nb-card relative rounded-xl border border-[#26324d]/15 bg-white p-4 shadow-[0_10px_30px_-14px_rgba(38,50,77,0.35)] sm:p-6">
			<span className="landing-nb-tape landing-nb-tape-blue" aria-hidden />
			<p className="landing-nb-script text-lg text-[#2f5fd0]">
				графики, которые строятся сами ↓
			</p>
			<svg
				viewBox="0 0 360 240"
				className="mt-2 w-full"
				aria-hidden
				fill="none"
			>
				<title>Координатная плоскость с параболой и синусоидой</title>
				{[40, 80, 120, 160, 200].map((x) => (
					<line
						key={`v${x}`}
						x1={x}
						x2={x}
						y1="10"
						y2="220"
						stroke="#2f5fd0"
						strokeOpacity="0.12"
					/>
				))}
				{[45, 85, 125, 165, 205].map((y) => (
					<line
						key={`h${y}`}
						x1="10"
						x2="350"
						y1={y}
						y2={y}
						stroke="#2f5fd0"
						strokeOpacity="0.12"
					/>
				))}
				<line
					x1="20"
					x2="350"
					y1="165"
					y2="165"
					stroke={INK}
					strokeWidth="1.6"
				/>
				<line x1="60" x2="60" y1="225" y2="12" stroke={INK} strokeWidth="1.6" />
				<path
					d="M 346 160 L 352 165 L 346 170"
					stroke={INK}
					strokeWidth="1.6"
				/>
				<path d="M 55 16 L 60 10 L 65 16" stroke={INK} strokeWidth="1.6" />
				<text x="352" y="182" className="fill-[#26324d] font-mono text-[12px]">
					x
				</text>
				<text x="70" y="22" className="fill-[#26324d] font-mono text-[12px]">
					y
				</text>
				<path
					d="M 30 60 Q 180 330, 330 60"
					stroke={BLUE}
					strokeWidth="2.6"
					strokeLinecap="round"
					pathLength={1}
					className="landing-nb-draw-hero-slow"
				/>
				<path
					d="M 20 165 Q 60 85, 100 165 T 180 165 T 260 165 T 340 165"
					stroke={RED}
					strokeWidth="2"
					strokeLinecap="round"
					pathLength={1}
					className="landing-nb-draw-hero-slower"
				/>
				<text
					x="246"
					y="52"
					className="landing-nb-script fill-[#2f5fd0] text-[15px]"
				>
					y = x²
				</text>
				<text
					x="252"
					y="140"
					className="landing-nb-script fill-[#d6453c] text-[15px]"
				>
					y = sin x
				</text>
			</svg>
		</div>
	);
}

function TopicChecklist() {
	return (
		<div className="landing-nb-card landing-nb-margin relative rounded-xl border border-[#26324d]/15 bg-white p-5 pl-16 shadow-[0_10px_30px_-14px_rgba(38,50,77,0.35)] sm:p-7 sm:pl-20">
			<span className="landing-nb-tape" aria-hidden />
			<p className="landing-nb-script text-2xl text-[#26324d]">
				Темы → задания экзамена
			</p>
			<ul className="mt-4 space-y-4">
				{PROGRESS_TOPICS.map((topic, i) => {
					const done = topic.percent === 100;
					return (
						<li key={topic.title}>
							<div className="flex items-start gap-3">
								<svg
									viewBox="0 0 24 24"
									className="mt-0.5 size-6 shrink-0"
									aria-hidden
									fill="none"
								>
									<title>Отметка о прохождении темы</title>
									<rect
										x="2"
										y="2"
										width="20"
										height="20"
										rx="4"
										stroke={done ? GREEN : BLUE}
										strokeWidth="2"
										pathLength={1}
										className="landing-nb-draw-view"
										style={{ animationDelay: `${i * 150}ms` }}
									/>
									{done ? (
										<path
											d="M 6 12.5 L 10.5 17 L 18 7.5"
											stroke={GREEN}
											strokeWidth="2.6"
											strokeLinecap="round"
											pathLength={1}
											className="landing-nb-draw-view"
											style={{ animationDelay: `${300 + i * 150}ms` }}
										/>
									) : null}
								</svg>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-baseline justify-between gap-x-3">
										<p
											className={`font-semibold ${done ? "text-[#3d8f60] line-through decoration-2" : "text-[#26324d]"}`}
										>
											{topic.title}
										</p>
										<p className="landing-nb-script shrink-0 text-lg text-[#d6453c]">
											{topic.points}
										</p>
									</div>
									<p className="font-mono text-xs text-[#26324d]/55">
										{topic.exam}
									</p>
									<div className="mt-2 h-3.5 border-b-2 border-dashed border-[#26324d]/20">
										<div
											className="landing-nb-highlight h-full"
											style={
												{
													"--p": topic.percent / 100,
													animationDelay: `${i * 130}ms`,
												} as React.CSSProperties
											}
										/>
									</div>
									<p className="mt-1 text-right font-mono text-xs text-[#26324d]/60">
										{topic.percent}%
									</p>
								</div>
							</div>
						</li>
					);
				})}
			</ul>
			<p className="landing-nb-script mt-5 rotate-[-1.5deg] text-lg text-[#3d8f60]">
				каждая закрытая тема = стабильные баллы на экзамене ✓
			</p>
		</div>
	);
}

function ScoreNotebook() {
	return (
		<div className="flex flex-col gap-6">
			<div className="landing-nb-card relative rounded-xl border border-[#26324d]/15 bg-white p-5 shadow-[0_10px_30px_-14px_rgba(38,50,77,0.35)] sm:p-7">
				<span className="landing-nb-tape landing-nb-tape-red" aria-hidden />
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<p className="landing-nb-script text-2xl text-[#26324d]">
						Рост балла по пробникам
					</p>
					<p className="font-mono text-xs text-[#26324d]/50">
						ЕГЭ · 100 баллов
					</p>
				</div>
				<svg
					viewBox="0 0 640 270"
					className="mt-3 w-full"
					role="img"
					aria-label="График: балл растёт с 34 на диагностике до цели 85 на ЕГЭ"
					fill="none"
				>
					{[40, 91, 142, 193].map((y) => (
						<line
							key={y}
							x1="30"
							x2="610"
							y1={y}
							y2={y}
							stroke="#2f5fd0"
							strokeOpacity="0.1"
						/>
					))}
					<line
						x1="30"
						x2="610"
						y1="39"
						y2="39"
						stroke={GREEN}
						strokeOpacity="0.5"
						strokeDasharray="7 7"
					/>
					<path
						d={NB_PATH}
						stroke={BLUE}
						strokeWidth="3"
						strokeLinecap="round"
						pathLength={1}
						className="landing-nb-draw-view"
					/>
					{NB_POINTS.map((point, i) => {
						const checkpoint = PROGRESS_SCORE_PATH[i];
						const last = i === NB_POINTS.length - 1;
						return (
							<g key={checkpoint.label}>
								<circle
									cx={point.x}
									cy={point.y}
									r={last ? 7 : 5}
									fill={last ? GREEN : "#ffffff"}
									stroke={last ? GREEN : BLUE}
									strokeWidth="2.5"
								/>
								<text
									x={point.x}
									y={point.y - 14}
									textAnchor="middle"
									className={`font-mono text-[15px] font-semibold ${last ? "fill-[#3d8f60]" : "fill-[#26324d]"}`}
								>
									{checkpoint.score}
								</text>
								<text
									x={point.x}
									y="262"
									textAnchor="middle"
									className="fill-[#26324d]/55 text-[11px]"
								>
									{checkpoint.label}
								</text>
							</g>
						);
					})}
					<text
						x="150"
						y="150"
						className="landing-nb-script fill-[#d6453c] text-[17px]"
						transform="rotate(-14 150 150)"
					>
						+11 за месяц!
					</text>
					<text
						x="470"
						y="30"
						className="landing-nb-script fill-[#3d8f60] text-[17px]"
					>
						цель ←
					</text>
				</svg>
			</div>

			<div className="landing-nb-card relative rounded-xl border border-[#26324d]/15 bg-white p-5 shadow-[0_10px_30px_-14px_rgba(38,50,77,0.35)] sm:p-7">
				<p className="landing-nb-script text-2xl text-[#26324d]">
					Что это значит для экзамена
				</p>
				<div className="mt-5 space-y-5">
					<div>
						<div className="flex items-baseline justify-between">
							<p className="font-mono text-xs font-semibold tracking-[0.18em] text-[#26324d]/60 uppercase">
								ЕГЭ · баллы
							</p>
							<p className="landing-nb-script text-lg text-[#3d8f60]">
								{PROGRESS_OUTCOME.ege}
							</p>
						</div>
						<div className="relative mt-2 h-3 rounded-full bg-gradient-to-r from-[#e58f8a] via-[#f2d678] to-[#7fc79a]">
							<span
								className="landing-nb-marker absolute -top-2.5 size-[22px] rounded-full border-[3px] border-[#d6453c] bg-white"
								style={{ left: "30%" }}
							/>
							<span
								className="landing-nb-marker absolute -top-2.5 size-[22px] rounded-full border-[3px] border-[#3d8f60] bg-white"
								style={{ left: "calc(85% - 12px)", animationDelay: "0.4s" }}
							/>
						</div>
						<div className="mt-1.5 flex justify-between font-mono text-xs text-[#26324d]/50">
							<span>0</span>
							<span className="text-[#d6453c]">старт · 34</span>
							<span className="text-[#3d8f60]">цель · 85</span>
							<span>100</span>
						</div>
					</div>
					<div>
						<div className="flex items-baseline justify-between">
							<p className="font-mono text-xs font-semibold tracking-[0.18em] text-[#26324d]/60 uppercase">
								ОГЭ · оценка
							</p>
							<p className="landing-nb-script text-lg text-[#3d8f60]">
								{PROGRESS_OUTCOME.oge}
							</p>
						</div>
						<div className="mt-3 flex items-center gap-2 sm:gap-3">
							{["2", "3", "4", "5"].map((grade, i) => (
								<span key={grade} className="flex items-center gap-2 sm:gap-3">
									<span
										className={`landing-nb-marker flex size-10 items-center justify-center rounded-full border-2 font-display text-lg font-semibold ${
											grade === "5"
												? "border-[#3d8f60] bg-[#3d8f60]/10 text-[#3d8f60]"
												: grade === "3"
													? "border-[#d6453c] text-[#d6453c]"
													: "border-[#26324d]/25 text-[#26324d]/45"
										}`}
										style={{ animationDelay: `${i * 150}ms` }}
									>
										{grade}
									</span>
									{i < 3 ? <span className="text-[#26324d]/30">→</span> : null}
								</span>
							))}
							<span className="landing-nb-script ml-1 text-lg text-[#2f5fd0]">
								твой путь
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Notebook — «живая тетрадь»: бумага в клетку, формулы дописывают себя,
 * графики строятся при скролле, прогресс — как дневник с отметками.
 */
export function NotebookLanding() {
	return (
		<div
			className="landing landing-notebook light"
			data-testid="landing-page-notebook"
			id="top"
		>
			<LandingNav
				activeVersion="notebook"
				solid
				tone="light"
				links={NAV}
				barClassName="border-[#26324d]/10 bg-[#fbf6e9]/95"
			/>

			{/* Hero */}
			<section className="landing-nb-paper relative overflow-hidden pb-20 pt-28 sm:pb-24 sm:pt-36">
				{HERO_FORMULAS.map((formula) => (
					<span
						key={formula.text}
						className={`landing-nb-write landing-nb-script pointer-events-none absolute hidden text-xl text-[#2f5fd0]/70 md:block ${formula.className}`}
						style={{ animationDelay: formula.delay }}
					>
						{formula.text}
					</span>
				))}
				<div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
					<div>
						<p className="landing-fade inline-block rounded-full border border-[#2f5fd0]/25 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#2f5fd0] uppercase">
							{LANDING_BRAND} · конспект, который работает
						</p>
						<h1 className="landing-fade landing-fade-delay-1 mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-[#26324d] sm:text-5xl md:text-6xl">
							Разложим ЕГЭ и ОГЭ{" "}
							<span className="relative inline-block">
								по полочкам
								<Squiggle className="absolute -bottom-1.5 left-0 h-3 w-full" />
							</span>
						</h1>
						<p
							className="landing-nb-write landing-nb-script mt-5 max-w-md text-2xl text-[#26324d]/75"
							style={{ animationDelay: "0.5s" }}
						>
							теория → практика → пробник → балл растёт сам
						</p>
						<p className="landing-fade landing-fade-delay-2 mt-4 max-w-xl text-lg leading-relaxed text-[#26324d]/70">
							Вся подготовка — как хороший конспект: каждая тема на своём месте,
							отмечен прогресс, а на полях — баллы, которые ты уже заработал.
						</p>
						<div className="landing-fade landing-fade-delay-3 mt-9 flex flex-wrap items-center gap-4">
							<Button
								asChild
								size="lg"
								className="rounded-full bg-[#2f5fd0] px-8 font-semibold text-white shadow-lg shadow-[#2f5fd0]/25 hover:bg-[#2f5fd0]/90"
							>
								<a href="#trial" data-testid="landing-hero-cta">
									{LANDING_TRIAL.cta}
								</a>
							</Button>
							<Button
								asChild
								size="lg"
								variant="outline"
								className="rounded-full border-[#26324d]/25 bg-white/70 px-8 text-[#26324d] hover:bg-white"
							>
								<a href="#progress">Открыть дневник</a>
							</Button>
						</div>
						<div className="landing-fade landing-fade-delay-3 mt-10 flex flex-wrap gap-x-6 gap-y-2">
							{LANDING_STATS.map((stat, i) => (
								<p
									key={stat.value}
									className="landing-nb-script text-xl text-[#d6453c]"
									style={{
										transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`,
									}}
								>
									{stat.value} — {stat.label}
								</p>
							))}
						</div>
					</div>
					<PlotBoard />
				</div>
			</section>

			{/* Margin notes marquee */}
			<div className="overflow-hidden border-y-2 border-dashed border-[#26324d]/15 bg-[#f3ecd9] py-3">
				<Marquee className="[--duration:26s] [--gap:2.5rem]">
					{MARGIN_NOTES.map((note, i) => (
						<span
							key={note}
							className="landing-nb-script text-xl"
							style={{
								color: i % 2 === 0 ? RED : BLUE,
								transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
							}}
						>
							{note}
							<span className="ml-10 text-[#26324d]/30" aria-hidden>
								✎
							</span>
						</span>
					))}
				</Marquee>
			</div>

			{/* Progress diary */}
			<section
				id="progress"
				className="landing-nb-paper relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
			>
				<div className="relative mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-nb-reveal text-sm font-semibold tracking-[0.2em] text-[#2f5fd0] uppercase">
						Дневник прогресса
					</p>
					<h2 className="landing-nb-reveal mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-[#26324d] sm:text-5xl">
						Как выглядит прогресс — и как он тянет оценку вверх
					</h2>
					<p className="landing-nb-reveal mt-4 max-w-2xl text-lg text-[#26324d]/70">
						На платформе видно каждую закрытую тему, каждый пробник и каждый
						прибавленный балл: {PROGRESS_OUTCOME.ege}, {PROGRESS_OUTCOME.oge}.
					</p>
					<div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
						<TopicChecklist />
						<ScoreNotebook />
					</div>
					<div className="mt-10 grid gap-5 md:grid-cols-3">
						{PROGRESS_IMPACT.map((item, i) => (
							<article
								key={item.title}
								className="landing-nb-reveal landing-nb-card relative rounded-xl border border-[#26324d]/15 bg-white p-6 shadow-[0_10px_30px_-14px_rgba(38,50,77,0.3)]"
								style={{
									transform: `rotate(${i === 1 ? 0.8 : i === 2 ? -0.6 : -0.9}deg)`,
									animationDelay: `${i * 140}ms`,
								}}
							>
								<span className="landing-nb-tape" aria-hidden />
								<p className="landing-nb-script text-xl text-[#2f5fd0]">
									запись №{i + 1}
								</p>
								<h3 className="mt-2 font-display text-lg font-semibold text-[#26324d]">
									{item.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-[#26324d]/70">
									{item.text}
								</p>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* Week timetable */}
			<section
				id="week"
				className="scroll-mt-20 border-y-2 border-dashed border-[#26324d]/15 bg-[#f3ecd9] py-20 sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-nb-reveal text-sm font-semibold tracking-[0.2em] text-[#2f5fd0] uppercase">
						Расписание
					</p>
					<h2 className="landing-nb-reveal mt-3 font-display text-3xl font-semibold tracking-tight text-[#26324d] sm:text-4xl">
						Неделя ученика — по расписанию, без хаоса
					</h2>
					<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{PROGRESS_WEEK.map((step, i) => (
							<article
								key={step.day}
								className="landing-nb-reveal landing-nb-card relative rounded-lg border border-[#26324d]/20 bg-white p-5 shadow-[0_8px_24px_-12px_rgba(38,50,77,0.35)]"
								style={{
									transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
									animationDelay: `${i * 120}ms`,
								}}
							>
								<div className="flex items-baseline justify-between">
									<p className="landing-nb-script text-3xl text-[#d6453c]">
										{step.day}
									</p>
									<span className="landing-nb-stamp">
										{i === 3 ? "замер!" : "план"}
									</span>
								</div>
								<h3 className="mt-3 border-t-2 border-dashed border-[#26324d]/15 pt-3 font-display text-lg font-semibold text-[#26324d]">
									{step.title}
								</h3>
								<p className="mt-1 text-sm text-[#26324d]/65">{step.text}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* Audience */}
			<section className="landing-nb-paper relative overflow-hidden py-20 sm:py-28">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-nb-reveal text-sm font-semibold tracking-[0.2em] text-[#2f5fd0] uppercase">
						Для кого
					</p>
					<h2 className="landing-nb-reveal mt-3 font-display text-3xl font-semibold tracking-tight text-[#26324d] sm:text-4xl">
						Найдётся страница для каждого
					</h2>
					<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{LANDING_AUDIENCE.map((item, i) => (
							<article
								key={item.title}
								className={`landing-nb-reveal landing-nb-card relative rounded-xl border border-[#26324d]/15 bg-white p-6 shadow-[0_8px_24px_-12px_rgba(38,50,77,0.3)] ${
									i === 0 ? "lg:col-span-2" : ""
								}`}
								style={{
									transform: `rotate(${(i % 3) - 1 === 0 ? 0 : (i % 3) - 1}deg)`,
									animationDelay: `${i * 100}ms`,
								}}
							>
								<p className="landing-nb-script text-2xl text-[#2f5fd0]">
									{item.title}
								</p>
								<p className="mt-2 text-sm leading-relaxed text-[#26324d]/70">
									{item.text}
								</p>
							</article>
						))}
						<div className="landing-nb-reveal flex items-center justify-center rounded-xl bg-[#2f5fd0] p-7 text-center">
							<p className="landing-nb-script text-2xl text-white">
								подберём твой план →
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Formats */}
			<section
				id="formats"
				className="scroll-mt-20 border-y-2 border-dashed border-[#26324d]/15 bg-[#f3ecd9] py-20 sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-nb-reveal text-sm font-semibold tracking-[0.2em] text-[#2f5fd0] uppercase">
						Форматы
					</p>
					<h2 className="landing-nb-reveal mt-3 font-display text-3xl font-semibold tracking-tight text-[#26324d] sm:text-4xl">
						Выбери свой разворот
					</h2>
					<div className="mt-14 grid gap-8 lg:grid-cols-3 lg:gap-6">
						{LANDING_FORMATS.map((format, i) => (
							<article
								key={format.id}
								id={format.id}
								className={`landing-nb-reveal landing-nb-card relative flex flex-col rounded-xl border bg-white p-7 pt-9 shadow-[0_12px_32px_-14px_rgba(38,50,77,0.35)] ${
									format.featured
										? "border-[#2f5fd0]/40 ring-2 ring-[#2f5fd0]/15"
										: "border-[#26324d]/15"
								}`}
								style={{
									transform: `rotate(${i === 1 ? 0.8 : -0.8}deg)`,
									animationDelay: `${i * 130}ms`,
								}}
							>
								<span
									className={
										format.featured
											? "landing-nb-tape landing-nb-tape-red"
											: "landing-nb-tape landing-nb-tape-blue"
									}
									aria-hidden
								/>
								{format.featured ? (
									<p className="landing-nb-stamp absolute right-5 top-4">
										выбор учеников
									</p>
								) : null}
								<h3 className="font-display text-2xl font-semibold text-[#26324d]">
									{format.title}
								</h3>
								<p className="landing-nb-script mt-3 text-3xl text-[#d6453c]">
									{format.highlight}
								</p>
								<p className="text-sm text-[#26324d]/50">
									{format.highlightHint}
								</p>
								<p className="mt-4 text-sm leading-relaxed text-[#26324d]/70">
									{format.lead}
								</p>
								<div className="mt-6 border-t-2 border-dashed border-[#26324d]/15 pt-5">
									<ul className="space-y-2 text-sm text-[#26324d]/80">
										{format.points.map((point) => (
											<li key={point} className="flex gap-2">
												<span aria-hidden className="font-bold text-[#3d8f60]">
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
												? "bg-[#2f5fd0] font-semibold text-white hover:bg-[#2f5fd0]/90"
												: "bg-[#26324d] text-white hover:bg-[#26324d]/90"
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
			<section
				id="reviews"
				className="landing-nb-paper scroll-mt-20 py-20 sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-nb-reveal text-sm font-semibold tracking-[0.2em] text-[#2f5fd0] uppercase">
						Отзывы
					</p>
					<h2 className="landing-nb-reveal mt-3 font-display text-3xl font-semibold tracking-tight text-[#26324d] sm:text-4xl">
						Записи на полях от учеников
					</h2>
				</div>
				<div className="relative mt-12">
					<Marquee pauseOnHover className="[--duration:50s] [--gap:1.25rem]">
						{LANDING_REVIEWS.filter((_, i) => i % 2 === 0).map((review) => (
							<ReviewCard
								key={review.id}
								review={review}
								className="landing-nb-card border-[#26324d]/15 bg-white shadow-[0_8px_24px_-12px_rgba(38,50,77,0.3)] [&_blockquote]:text-[#26324d]/80 [&_figcaption]:border-[#26324d]/10 [&_figcaption_p:first-child]:text-[#26324d] [&_figcaption_p:last-child]:text-[#26324d]/50"
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
								className="landing-nb-card border-[#26324d]/15 bg-white shadow-[0_8px_24px_-12px_rgba(38,50,77,0.3)] [&_blockquote]:text-[#26324d]/80 [&_figcaption]:border-[#26324d]/10 [&_figcaption_p:first-child]:text-[#26324d] [&_figcaption_p:last-child]:text-[#26324d]/50"
							/>
						))}
					</Marquee>
				</div>
			</section>

			{/* FAQ */}
			<section
				id="faq"
				className="scroll-mt-20 border-y-2 border-dashed border-[#26324d]/15 bg-[#f3ecd9] py-20 sm:py-28"
			>
				<div className="mx-auto max-w-3xl px-4 sm:px-6">
					<p className="landing-nb-reveal text-sm font-semibold tracking-[0.2em] text-[#2f5fd0] uppercase">
						Вопросы
					</p>
					<h2 className="landing-nb-reveal mt-3 font-display text-3xl font-semibold tracking-tight text-[#26324d] sm:text-4xl">
						Частые вопросы
					</h2>
					<Accordion type="single" collapsible className="mt-10 w-full">
						{LANDING_FAQ.map((item) => (
							<AccordionItem
								key={item.q}
								value={item.q}
								className="border-[#26324d]/15"
							>
								<AccordionTrigger className="text-left text-base font-medium text-[#26324d]">
									{item.q}
								</AccordionTrigger>
								<AccordionContent className="text-[#26324d]/70">
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
				className="landing-nb-paper relative scroll-mt-20 overflow-hidden py-24 text-center sm:py-32"
			>
				<div className="relative mx-auto max-w-2xl px-4">
					<p className="landing-nb-reveal landing-nb-script text-2xl text-[#d6453c]">
						начинаем с чистого листа!
					</p>
					<h2 className="landing-nb-reveal mt-4 font-display text-4xl font-semibold tracking-tight text-[#26324d] sm:text-5xl">
						{LANDING_TRIAL.title}
					</h2>
					<p className="landing-nb-reveal mx-auto mt-5 max-w-lg text-lg text-[#26324d]/70">
						{LANDING_TRIAL.body}
					</p>
					<Button
						asChild
						size="lg"
						className="landing-nb-reveal mt-10 rounded-full bg-[#2f5fd0] px-10 font-semibold text-white shadow-xl shadow-[#2f5fd0]/25 hover:bg-[#2f5fd0]/90"
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
				testIdPrefix="landing-notebook"
				className="border-[#26324d]/10 bg-[#26324d] text-white [--pm-amber:#f2d678] [--pm-amber-bright:#f7e39a] [--pm-navy:#26324d]"
			/>
		</div>
	);
}

export default NotebookLanding;
