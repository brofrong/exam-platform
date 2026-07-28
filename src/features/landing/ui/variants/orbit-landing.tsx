import {
	LANDING_BRAND,
	LANDING_FORMATS,
	LANDING_IMAGES,
	LANDING_TRIAL,
} from "#/features/landing/lib/content";
import { LANDING_REVIEWS } from "#/features/landing/lib/reviews";
import { LandingFooter } from "#/features/landing/ui/landing-footer";
import { LandingNav } from "#/features/landing/ui/landing-nav";
import { Button } from "@/components/ui/button";

const NAV = [
	{ href: "#score", label: "Цель" },
	{ href: "#path", label: "Путь" },
	{ href: "#formats", label: "Формат" },
	{ href: "#voices", label: "Отзывы" },
	{ href: "#start", label: "Старт" },
] as const;

const SCOREBOARD = [
	{ from: "40", to: "70+", note: "с нуля к уверенному порогу" },
	{ from: "60", to: "80+", note: "закрываем вторую часть" },
	{ from: "75", to: "90+", note: "режим эксперта" },
] as const;

const PATH = [
	{
		step: "01",
		title: "Диагностика",
		text: "Смотрим, где реально дыры — не «весь учебник», а узкие места.",
	},
	{
		step: "02",
		title: "План на балл",
		text: "Собираем маршрут под твою цель: 70, 80 или 90+.",
	},
	{
		step: "03",
		title: "Тренировка",
		text: "Регулярные сеты задач + автопроверка на платформе.",
	},
	{
		step: "04",
		title: "Финиш",
		text: "Пробники, тайминг, спокойная сдача без сюрпризов.",
	},
] as const;

/**
 * Orbit — scoreboard / mission-control.
 * Forest + lime, formats as numbered lanes, score trajectories first.
 */
export function OrbitLanding() {
	return (
		<div
			className="landing landing-scoreboard light"
			data-testid="landing-page-orbit"
			id="top"
		>
			<LandingNav
				activeVersion="orbit"
				solid
				links={NAV}
				barClassName="border-[#1a3d28] bg-[#07140e]/95"
			/>

			{/* Hero — giant score target */}
			<section className="relative overflow-hidden bg-[#07140e] pb-20 pt-28 text-[#e8f5e9] sm:pb-28 sm:pt-32">
				<div className="landing-score-grid pointer-events-none absolute inset-0 opacity-40" />
				<div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-fade font-mono text-xs tracking-[0.35em] text-[#b8f000] uppercase">
						{LANDING_BRAND} · SCOREBOARD
					</p>
					<h1 className="landing-fade landing-fade-delay-1 mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
						Твой балл — это <span className="text-[#b8f000]">не лотерея</span>
					</h1>
					<p className="landing-fade landing-fade-delay-2 mt-6 max-w-xl text-lg text-[#e8f5e9]/70">
						ЕГЭ и ОГЭ по математике и физике: считаем траекторию, закрываем
						дыры, идём к цифре, которую ты сам назвал.
					</p>
					<div className="landing-fade landing-fade-delay-3 mt-10 flex flex-wrap gap-3">
						<Button
							asChild
							size="lg"
							className="rounded-none bg-[#b8f000] px-8 font-semibold text-[#07140e] hover:bg-[#d0ff4a]"
						>
							<a href="#start" data-testid="landing-hero-cta">
								Записаться на разбор
							</a>
						</Button>
						<a
							href="#score"
							className="inline-flex items-center px-2 font-mono text-sm tracking-wide text-[#b8f000] no-underline hover:underline"
						>
							Смотреть траектории →
						</a>
					</div>
				</div>
			</section>

			{/* Score trajectories — unique block */}
			<section
				id="score"
				className="scroll-mt-20 border-y border-[#1a3d28] bg-[#0c1f15] py-16 text-[#e8f5e9] sm:py-20"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="font-mono text-xs tracking-[0.3em] text-[#b8f000] uppercase">
						Траектории
					</p>
					<div className="mt-10 grid gap-6 md:grid-cols-3">
						{SCOREBOARD.map((row) => (
							<article
								key={row.to}
								className="landing-score-card border border-[#1a3d28] bg-[#07140e] p-6"
							>
								<p className="font-mono text-sm text-[#e8f5e9]/45">
									было → стало
								</p>
								<p className="mt-4 font-display text-5xl font-semibold tracking-tight">
									<span className="text-[#e8f5e9]/35">{row.from}</span>
									<span className="mx-2 text-[#b8f000]">→</span>
									<span className="text-[#b8f000]">{row.to}</span>
								</p>
								<p className="mt-4 text-sm text-[#e8f5e9]/65">{row.note}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* Path — before formats */}
			<section
				id="path"
				className="scroll-mt-20 bg-[#07140e] py-20 text-[#e8f5e9] sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<h2 className="font-display text-3xl font-semibold sm:text-4xl">
						Как растёт балл
					</h2>
					<ol className="mt-12 space-y-0 border-l border-[#b8f000]/40">
						{PATH.map((item) => (
							<li key={item.step} className="relative py-6 pl-8 sm:pl-12">
								<span className="absolute top-8 -left-[5px] size-2.5 rounded-full bg-[#b8f000]" />
								<p className="font-mono text-xs tracking-widest text-[#b8f000]">
									{item.step}
								</p>
								<h3 className="mt-1 font-display text-2xl font-semibold">
									{item.title}
								</h3>
								<p className="mt-2 max-w-xl text-sm text-[#e8f5e9]/65">
									{item.text}
								</p>
							</li>
						))}
					</ol>
				</div>
			</section>

			{/* Formats — lane list, not cards */}
			<section
				id="formats"
				className="scroll-mt-20 bg-[#b8f000] py-20 text-[#07140e] sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="font-mono text-xs tracking-[0.3em] uppercase">
						Выбери дорожку
					</p>
					<h2 className="mt-3 font-display text-3xl font-semibold sm:text-5xl">
						Три формата — одна цель
					</h2>
					<ul className="mt-14 divide-y divide-[#07140e]/20 border-y border-[#07140e]/20">
						{LANDING_FORMATS.map((format, i) => (
							<li
								key={format.id}
								id={format.id}
								className="grid gap-4 py-8 sm:grid-cols-[5rem_1fr_auto] sm:items-center"
							>
								<span className="font-mono text-3xl font-semibold opacity-40">
									{String(i + 1).padStart(2, "0")}
								</span>
								<div>
									<h3 className="font-display text-2xl font-semibold">
										{format.title}
									</h3>
									<p className="mt-1 text-sm opacity-70">
										{format.highlight} · {format.why}
									</p>
								</div>
								<a
									href="#start"
									className="font-mono text-sm font-semibold tracking-wide no-underline underline-offset-4 hover:underline"
								>
									Взять →
								</a>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* Compact about + photo */}
			<section className="bg-[#0c1f15] py-20 text-[#e8f5e9] sm:py-24">
				<div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
					<img
						src={LANDING_IMAGES.whiteboard}
						alt="Виктория"
						className="aspect-[4/3] w-full object-cover grayscale contrast-125"
					/>
					<div>
						<p className="font-mono text-xs tracking-[0.3em] text-[#b8f000] uppercase">
							Тренер
						</p>
						<h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
							Виктория · эксперт ЕГЭ
						</h2>
						<p className="mt-5 text-[#e8f5e9]/70">
							10 лет готовлю к экзаменам. Сама сдала профиль на 95+ три раза.
							200+ учеников — и ни одного «просто позанимаемся».
						</p>
					</div>
				</div>
			</section>

			{/* Voices — stacked quotes, not marquee */}
			<section
				id="voices"
				className="scroll-mt-20 bg-[#07140e] py-20 text-[#e8f5e9] sm:py-28"
			>
				<div className="mx-auto max-w-3xl px-4 sm:px-6">
					<h2 className="font-display text-3xl font-semibold">Голоса с поля</h2>
					<div className="mt-12 space-y-10">
						{LANDING_REVIEWS.slice(0, 4).map((review) => (
							<figure
								key={review.id}
								className="border-l-2 border-[#b8f000] pl-5"
							>
								<blockquote className="text-lg leading-relaxed text-[#e8f5e9]/85">
									«{review.quote}»
								</blockquote>
								<figcaption className="mt-3 font-mono text-xs tracking-wide text-[#b8f000]">
									{review.name} · {review.meta}
								</figcaption>
							</figure>
						))}
					</div>
				</div>
			</section>

			<section
				id="start"
				className="scroll-mt-20 bg-[#b8f000] py-24 text-center text-[#07140e] sm:py-32"
			>
				<div className="mx-auto max-w-2xl px-4">
					<h2 className="font-display text-4xl font-semibold sm:text-5xl">
						30 минут — и понятен план
					</h2>
					<p className="mt-5 text-[#07140e]/75">{LANDING_TRIAL.body}</p>
					<Button
						asChild
						size="lg"
						className="mt-8 rounded-none bg-[#07140e] px-10 text-[#b8f000] hover:bg-[#0c1f15]"
					>
						<a
							href={LANDING_TRIAL.href}
							target="_blank"
							rel="noreferrer"
							data-testid="landing-trial-cta"
						>
							Написать в Telegram
						</a>
					</Button>
				</div>
			</section>

			<LandingFooter
				testIdPrefix="landing-orbit"
				className="border-[#1a3d28] bg-[#07140e] [--pm-amber:#b8f000]"
			/>
		</div>
	);
}

export default OrbitLanding;
