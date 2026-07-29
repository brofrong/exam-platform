import {
	LANDING_BRAND,
	LANDING_FAQ,
	LANDING_FORMATS,
	LANDING_IMAGES,
	LANDING_STATS,
	LANDING_TRIAL,
} from "#/features/landing/lib/content";
import { LANDING_REVIEWS } from "#/features/landing/lib/reviews";
import { LandingFooter } from "#/features/landing/ui/landing-footer";
import { LandingNav } from "#/features/landing/ui/landing-nav";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const NAV = [
	{ href: "#status", label: "Статус" },
	{ href: "#track", label: "Трек" },
	{ href: "#modules", label: "Модули" },
	{ href: "#faq", label: "Сбой" },
	{ href: "#launch", label: "Запуск" },
] as const;

const MODULES = [
	{
		code: "Δx",
		title: "Диагностика",
		desc: "Пробный урок: фиксируем точку входа и карту пробелов.",
	},
	{
		code: "∑",
		title: "Система",
		desc: "План под балл: темы, домашки, автопроверка, повторения.",
	},
	{
		code: "λ",
		title: "Личный ритм",
		desc: "1–3 раза в неделю по 60 минут. Zoom + кабинет платформы.",
	},
] as const;

function FormulaField() {
	return (
		<svg
			className="landing-neon-field pointer-events-none absolute inset-0 h-full w-full"
			viewBox="0 0 1200 800"
			aria-hidden
		>
			<title>Поле формул</title>
			<defs>
				<linearGradient id="neon-line" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#22d3ee" />
					<stop offset="1" stopColor="#d946ef" />
				</linearGradient>
			</defs>
			<g stroke="url(#neon-line)" strokeWidth="1" fill="none" opacity="0.22">
				<circle cx="150" cy="150" r="60" className="landing-neon-drift" />
				<circle
					cx="150"
					cy="150"
					r="95"
					className="landing-neon-drift landing-neon-drift-2"
				/>
				<path
					d="M850 120 L1050 120 L950 260 Z"
					className="landing-neon-drift landing-neon-drift-3"
				/>
				<path
					d="M80 620 Q 240 420 420 560 T 700 420"
					className="landing-neon-drift landing-neon-drift-2"
				/>
				<path
					d="M820 620 L1120 620 M820 580 L1060 580 M820 540 L960 540"
					className="landing-neon-drift"
				/>
			</g>
			<g
				fontFamily="ui-monospace, monospace"
				fontSize="18"
				fill="#22d3ee"
				opacity="0.35"
			>
				<text x="60" y="80" className="landing-neon-glyph">
					x² + y² = r²
				</text>
				<text
					x="900"
					y="320"
					className="landing-neon-glyph landing-neon-glyph-2"
				>
					F = ma
				</text>
				<text
					x="320"
					y="700"
					className="landing-neon-glyph landing-neon-glyph-3"
				>
					∫f(x)dx
				</text>
				<text x="720" y="60" className="landing-neon-glyph">
					sin θ = y/r
				</text>
			</g>
		</svg>
	);
}

/**
 * Neon — dark mission cockpit with cyan/magenta glow and formula field.
 */
export function NeonLanding() {
	return (
		<div
			className="landing landing-neon light"
			data-testid="landing-page-neon"
			id="top"
		>
			<LandingNav
				activeVersion="neon"
				solid
				links={NAV}
				barClassName="border-[#22d3ee]/20 bg-[#04060e]/95"
			/>

			{/* Hero — cockpit */}
			<section className="landing-neon-bg relative overflow-hidden pb-24 pt-28 text-[#e6faff] sm:pb-32 sm:pt-36">
				<FormulaField />
				<div className="landing-neon-glow pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-[#22d3ee]/15 blur-[120px]" />
				<div className="landing-neon-glow pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#d946ef]/15 blur-[120px]" />

				<div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-fade font-mono text-xs tracking-[0.4em] text-[#22d3ee] uppercase">
						{LANDING_BRAND} · CONTROL ROOM
					</p>
					<h1 className="landing-fade landing-fade-delay-1 mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
						Балл по ЕГЭ — это{" "}
						<span className="landing-neon-gradient">инженерия</span>
					</h1>
					<p className="landing-fade landing-fade-delay-2 mt-6 max-w-xl text-lg text-[#e6faff]/70">
						Математика и физика без магии: диагностика, модульные треки,
						прозрачный прогресс на платформе.
					</p>
					<div className="landing-fade landing-fade-delay-3 mt-10 flex flex-wrap items-center gap-4">
						<Button
							asChild
							size="lg"
							className="rounded-none border border-[#22d3ee] bg-[#22d3ee]/10 px-8 font-mono text-sm tracking-wide text-[#22d3ee] hover:bg-[#22d3ee] hover:text-[#04060e]"
						>
							<a href="#launch" data-testid="landing-hero-cta">
								Запустить диагностику
							</a>
						</Button>
						<a
							href="#status"
							className="font-mono text-xs tracking-widest text-[#d946ef] underline underline-offset-4"
						>
							Смотреть статус
						</a>
					</div>

					{/* HUD stats */}
					<div
						id="status"
						className="landing-neon-panel mt-16 grid scroll-mt-24 gap-px overflow-hidden border border-[#22d3ee]/25 bg-[#22d3ee]/20 sm:grid-cols-2 lg:grid-cols-4"
					>
						{LANDING_STATS.map((stat) => (
							<div
								key={stat.value}
								className="landing-neon-cell bg-[#04060e]/90 p-5"
							>
								<p className="font-display text-3xl font-semibold text-[#e6faff]">
									{stat.value}
								</p>
								<p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-[#22d3ee]/70 uppercase">
									{stat.label}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Track */}
			<section
				id="track"
				className="scroll-mt-20 border-y border-[#22d3ee]/15 bg-[#070b18] py-20 text-[#e6faff] sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="font-mono text-xs tracking-[0.3em] text-[#d946ef] uppercase">
						Трек подготовки
					</p>
					<h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
						Три модуля — от входа к баллу
					</h2>
					<div className="mt-14 grid gap-4 md:grid-cols-3">
						{MODULES.map((mod, i) => (
							<article
								key={mod.code}
								className="landing-neon-module border border-[#22d3ee]/20 bg-[#04060e] p-6"
							>
								<div className="flex items-baseline justify-between">
									<p className="font-display text-4xl text-[#22d3ee]">
										{mod.code}
									</p>
									<p className="font-mono text-[10px] text-[#e6faff]/40">
										MOD-0{i + 1}
									</p>
								</div>
								<h3 className="mt-4 font-display text-xl font-semibold">
									{mod.title}
								</h3>
								<p className="mt-2 text-sm text-[#e6faff]/60">{mod.desc}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* Operator */}
			<section className="bg-[#04060e] py-20 text-[#e6faff] sm:py-24">
				<div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
					<div className="relative">
						<img
							src={LANDING_IMAGES.portrait}
							alt="Виктория"
							className="landing-neon-img aspect-[5/6] w-full object-cover"
						/>
						<div className="landing-neon-frame pointer-events-none absolute inset-0 border border-[#22d3ee]/40" />
						<p className="landing-neon-tag absolute bottom-4 left-4 border border-[#d946ef]/60 bg-[#04060e]/80 px-3 py-1 font-mono text-[10px] tracking-[0.25em] text-[#d946ef] uppercase">
							Оператор: Виктория
						</p>
					</div>
					<div>
						<p className="font-mono text-xs tracking-[0.3em] text-[#22d3ee] uppercase">
							Кто ведёт систему
						</p>
						<h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
							Эксперт ЕГЭ на связи каждый урок
						</h2>
						<p className="mt-5 text-[#e6faff]/70">
							Виктория — преподаватель физики и математики. Три высших, эксперт
							ЕГЭ по профилю. Ведёт тебя по треку до целевого балла, показывает
							прогресс по темам и не даёт «учить всё подряд».
						</p>
						<ul className="mt-8 space-y-3 border-l border-[#22d3ee]/30 pl-5">
							<li className="text-sm text-[#e6faff]/75">
								Уроки 1–3 раза в неделю по 60 минут в Zoom
							</li>
							<li className="text-sm text-[#e6faff]/75">
								Домашки с автопроверкой и разбором на платформе
							</li>
							<li className="text-sm text-[#e6faff]/75">
								Пробники + план на месяц после диагностики
							</li>
						</ul>
					</div>
				</div>
			</section>

			{/* Formats — modules */}
			<section
				id="modules"
				className="scroll-mt-20 bg-[#070b18] py-20 text-[#e6faff] sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="font-mono text-xs tracking-[0.3em] text-[#22d3ee] uppercase">
						Режимы работы
					</p>
					<h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
						Выбери модуль под свой темп
					</h2>
					<div className="mt-14 grid gap-4 lg:grid-cols-3">
						{LANDING_FORMATS.map((format) => (
							<article
								key={format.id}
								id={format.id}
								className={`landing-neon-module flex flex-col border p-6 ${
									format.featured
										? "border-[#d946ef]/60 bg-[#d946ef]/5"
										: "border-[#22d3ee]/20 bg-[#04060e]"
								}`}
							>
								<p className="font-mono text-[10px] tracking-[0.25em] text-[#22d3ee]/60 uppercase">
									{format.featured ? "core module" : "optional"}
								</p>
								<h3 className="mt-2 font-display text-2xl font-semibold">
									{format.title}
								</h3>
								<p className="mt-3 font-display text-3xl font-semibold text-[#22d3ee]">
									{format.highlight}
								</p>
								<p className="mt-1 text-sm text-[#e6faff]/50">
									{format.highlightHint}
								</p>
								<p className="mt-4 text-sm leading-relaxed text-[#e6faff]/70">
									{format.why}
								</p>
								<div className="mt-auto pt-6">
									<Button
										asChild
										className={`w-full rounded-none border font-mono text-xs tracking-wide ${
											format.featured
												? "border-[#d946ef] bg-[#d946ef]/10 text-[#d946ef] hover:bg-[#d946ef] hover:text-[#04060e]"
												: "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee] hover:bg-[#22d3ee] hover:text-[#04060e]"
										}`}
									>
										<a href="#launch">{format.cta}</a>
									</Button>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* Logs */}
			<section className="bg-[#04060e] py-20 text-[#e6faff] sm:py-24">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<div className="flex flex-wrap items-baseline justify-between gap-2">
						<h2 className="font-display text-3xl font-semibold">
							Логи учеников
						</h2>
						<p className="font-mono text-xs text-[#22d3ee]/60">
							records: {LANDING_REVIEWS.length}
						</p>
					</div>
					<div className="landing-neon-scroll mt-10 flex gap-4 overflow-x-auto pb-4">
						{LANDING_REVIEWS.slice(0, 6).map((review) => (
							<figure
								key={review.id}
								className="landing-neon-module w-[min(85vw,22rem)] shrink-0 border border-[#22d3ee]/20 bg-[#070b18] p-5"
							>
								<p className="font-mono text-[10px] tracking-[0.2em] text-[#d946ef] uppercase">
									log · {review.meta}
								</p>
								<blockquote className="mt-3 text-sm leading-relaxed text-[#e6faff]/85">
									«{review.quote}»
								</blockquote>
								<figcaption className="mt-4 font-mono text-xs text-[#22d3ee]">
									— {review.name}
								</figcaption>
							</figure>
						))}
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section
				id="faq"
				className="scroll-mt-20 border-y border-[#22d3ee]/15 bg-[#070b18] py-20 text-[#e6faff] sm:py-28"
			>
				<div className="mx-auto max-w-3xl px-4 sm:px-6">
					<p className="font-mono text-xs tracking-[0.3em] text-[#d946ef] uppercase">
						Если система дала сбой
					</p>
					<h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
						Частые вопросы
					</h2>
					<Accordion type="single" collapsible className="mt-10 w-full">
						{LANDING_FAQ.map((item) => (
							<AccordionItem
								key={item.q}
								value={item.q}
								className="border-[#22d3ee]/15"
							>
								<AccordionTrigger className="text-left text-base font-medium text-[#e6faff]">
									{item.q}
								</AccordionTrigger>
								<AccordionContent className="text-[#e6faff]/65">
									{item.a}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</section>

			{/* Launch */}
			<section
				id="launch"
				className="scroll-mt-20 bg-[#04060e] py-28 text-center text-[#e6faff] sm:py-36"
			>
				<div className="mx-auto max-w-2xl px-4">
					<p className="font-mono text-xs tracking-[0.4em] text-[#22d3ee] uppercase">
						Launch sequence
					</p>
					<h2 className="mt-6 font-display text-4xl font-semibold sm:text-5xl">
						30 минут — и маршрут собран
					</h2>
					<p className="mx-auto mt-5 max-w-lg text-[#e6faff]/65">
						{LANDING_TRIAL.body}
					</p>
					<Button
						asChild
						size="lg"
						className="mt-10 rounded-none border border-[#d946ef] bg-[#d946ef]/10 px-10 font-mono text-sm tracking-wide text-[#d946ef] hover:bg-[#d946ef] hover:text-[#04060e]"
					>
						<a
							href={LANDING_TRIAL.href}
							target="_blank"
							rel="noreferrer"
							data-testid="landing-trial-cta"
						>
							Инициировать в Telegram
						</a>
					</Button>
				</div>
			</section>

			<LandingFooter
				testIdPrefix="landing-neon"
				className="border-[#22d3ee]/15 bg-[#04060e] [--pm-amber:#22d3ee]"
			/>
		</div>
	);
}

export default NeonLanding;
