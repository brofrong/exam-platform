import {
	LANDING_AUDIENCE,
	LANDING_BRAND,
	LANDING_FAQ,
	LANDING_FORMATS,
	LANDING_IMAGES,
	LANDING_STATS,
	LANDING_TRIAL,
	LANDING_WHY,
} from "#/features/landing/lib/content";
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
	{ href: "#about", label: "Обо мне" },
	{ href: "#who", label: "Для кого" },
	{ href: "#steps", label: "Как идём" },
	{ href: "#formats", label: "Форматы" },
	{ href: "#reviews", label: "Отзывы" },
	{ href: "#faq", label: "Вопросы" },
] as const;

const MARQUEE_WORDS = [
	"алгебра",
	"геометрия",
	"кинематика",
	"логарифмы",
	"векторы",
	"электродинамика",
	"тригонометрия",
	"оптика",
	"производная",
	"термодинамика",
] as const;

const STEPS = [
	{
		n: "01",
		title: "Диагностика",
		text: "30 минут: смотрим текущий уровень, цель и дедлайн.",
	},
	{
		n: "02",
		title: "План на месяц",
		text: "Карта тем, расписание уроков и домашка под твой темп.",
	},
	{
		n: "03",
		title: "Уроки + платформа",
		text: "Zoom-встречи, автопроверка ДЗ, пробники и повторения.",
	},
	{
		n: "04",
		title: "Рост балла",
		text: "Каждые 4 недели — замер прогресса и корректировка плана.",
	},
] as const;

const INK = "text-[#2e2440]";

function Blobs() {
	return (
		<>
			<div className="landing-bloom-blob left-[-8rem] top-[-6rem] h-[26rem] w-[26rem] bg-[#f9a8d4]/50" />
			<div className="landing-bloom-blob landing-bloom-blob-2 right-[-6rem] top-[8rem] h-[22rem] w-[22rem] bg-[#93c5fd]/50" />
			<div className="landing-bloom-blob landing-bloom-blob-3 bottom-[-10rem] left-[30%] h-[24rem] w-[24rem] bg-[#fdba74]/40" />
		</>
	);
}

function Rings({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 200 200"
			className={className}
			aria-hidden
			fill="none"
			stroke="currentColor"
		>
			<title>Декоративные кольца</title>
			<circle
				cx="100"
				cy="100"
				r="90"
				strokeWidth="1.5"
				strokeDasharray="6 10"
			/>
			<circle cx="100" cy="100" r="64" strokeWidth="1.5" />
			<circle
				cx="100"
				cy="100"
				r="38"
				strokeWidth="1.5"
				strokeDasharray="4 8"
			/>
			<circle cx="190" cy="100" r="7" fill="currentColor" stroke="none" />
		</svg>
	);
}

/**
 * Bloom — airy light pastel theme with scroll-driven reveals everywhere.
 */
export function BloomLanding() {
	return (
		<div
			className="landing landing-bloom light"
			data-testid="landing-page-bloom"
			id="top"
		>
			<LandingNav
				activeVersion="bloom"
				solid
				tone="light"
				links={NAV}
				barClassName="border-[#2e2440]/10 bg-[#fdf9f3] shadow-sm"
			/>

			{/* Hero */}
			<section className="relative overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-36">
				<Blobs />
				<div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
					<div>
						<p className="landing-fade inline-block rounded-full border border-[#f97316]/30 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#c2410c] uppercase backdrop-blur-sm">
							{LANDING_BRAND} · онлайн-школа
						</p>
						<h1
							className={`landing-fade landing-fade-delay-1 mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl ${INK}`}
						>
							Математика и физика{" "}
							<span className="relative inline-block">
								<span className="relative z-10">без страха</span>
								<span
									className="absolute inset-x-0 bottom-1 -z-0 h-3 -rotate-1 rounded-sm bg-[#f9a8d4]/70"
									aria-hidden
								/>
							</span>{" "}
							— и с высоким баллом
						</h1>
						<p className="landing-fade landing-fade-delay-2 mt-6 max-w-xl text-lg leading-relaxed text-[#2e2440]/70">
							Разберём всё по шагам — от базы до второй части. Спокойная
							атмосфера, личный план и прогресс, который видно каждую неделю.
						</p>
						<div className="landing-fade landing-fade-delay-3 mt-9 flex flex-wrap items-center gap-4">
							<Button
								asChild
								size="lg"
								className="rounded-full bg-[#f97316] px-8 text-white shadow-lg shadow-[#f97316]/30 hover:bg-[#fb923c]"
							>
								<a href="#trial" data-testid="landing-hero-cta">
									{LANDING_TRIAL.cta}
								</a>
							</Button>
							<Button
								asChild
								size="lg"
								variant="outline"
								className="rounded-full border-[#2e2440]/20 bg-white/70 px-8 text-[#2e2440] backdrop-blur-sm hover:bg-white"
							>
								<a href="#about">Узнать обо мне</a>
							</Button>
						</div>
						<div className="landing-fade landing-fade-delay-3 mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
							{LANDING_STATS.map((stat) => (
								<div
									key={stat.value}
									className="landing-bloom-card rounded-2xl border border-[#2e2440]/15 bg-white shadow-sm/80 p-4 backdrop-blur-sm"
								>
									<p className="font-display text-xl font-semibold text-[#2e2440]">
										{stat.value}
									</p>
									<p className="mt-0.5 text-xs text-[#2e2440]/55">
										{stat.label}
									</p>
								</div>
							))}
						</div>
					</div>

					<div className="relative mx-auto w-full max-w-xs sm:max-w-sm">
						<Rings className="landing-bloom-spin-slow absolute -right-8 -top-8 z-10 h-28 w-28 text-[#f97316]/60 sm:h-36 sm:w-36" />
						<div className="landing-bloom-float relative overflow-hidden rounded-[2.5rem] border-4 border-white shadow-2xl shadow-[#2e2440]/20">
							<img
								src={LANDING_IMAGES.hero}
								alt="Виктория — преподаватель"
								className="aspect-[4/5] w-full object-cover"
							/>
						</div>
						<div className="landing-bloom-float-2 absolute -bottom-6 -left-6 rounded-2xl border border-[#2e2440]/15 bg-white shadow-sm px-5 py-4 shadow-xl">
							<p className="font-display text-2xl font-semibold text-[#f97316]">
								30 мин
							</p>
							<p className="text-xs text-[#2e2440]/60">бесплатный урок</p>
						</div>
					</div>
				</div>
			</section>

			{/* Marquee strip */}
			<div className="overflow-hidden border-y border-[#2e2440]/10 bg-[#2e2440] py-3">
				<Marquee className="[--duration:30s] [--gap:2.5rem]">
					{MARQUEE_WORDS.map((word) => (
						<span
							key={word}
							className="font-display text-sm font-medium tracking-[0.25em] text-white/80 uppercase"
						>
							{word} ✳
						</span>
					))}
				</Marquee>
			</div>

			{/* Audience */}
			<section
				id="who"
				className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
			>
				<div className="landing-bloom-blob landing-bloom-blob-2 right-[-10rem] top-10 h-[20rem] w-[20rem] bg-[#c4b5fd]/40" />
				<div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-bloom-reveal text-sm font-semibold tracking-[0.2em] text-[#f97316] uppercase">
						Для кого
					</p>
					<h2
						className={`landing-bloom-reveal mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl ${INK}`}
					>
						Кому подойдут занятия
					</h2>
					<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{LANDING_AUDIENCE.map((item, i) => (
							<article
								key={item.title}
								className={`landing-bloom-reveal-scale landing-bloom-card rounded-3xl border border-[#2e2440]/15 bg-white shadow-sm p-6 sm:p-7 ${
									i === 0 ? "lg:col-span-2" : ""
								}`}
								style={{
									animationRange: `entry ${i * 4}% cover ${34 + i * 4}%`,
								}}
							>
								<p className="font-display text-lg font-semibold text-[#2e2440]">
									{item.title}
								</p>
								<p className="mt-2 text-sm leading-relaxed text-[#2e2440]/65">
									{item.text}
								</p>
							</article>
						))}
						<div className="landing-bloom-reveal-scale flex items-center justify-center rounded-3xl bg-gradient-to-br from-[#f97316] to-[#f9a8d4] p-7 text-center">
							<p className="font-display text-xl font-semibold text-white">
								Найдём формат под твою цель →
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* About */}
			<section
				id="about"
				className="scroll-mt-20 border-y border-[#2e2440]/10 bg-white/60 py-20 sm:py-28"
			>
				<div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
					<div className="landing-bloom-reveal-left relative mx-auto w-full max-w-sm">
						<div className="landing-bloom-float-3 absolute -left-4 -top-4 z-10 rounded-2xl bg-[#f9a8d4] px-4 py-2 font-display text-sm font-semibold text-[#2e2440] shadow-lg">
							три высших ✦ эксперт ЕГЭ
						</div>
						<div className="landing-bloom-img overflow-hidden rounded-[2.5rem] border-4 border-white shadow-xl">
							<img
								src={LANDING_IMAGES.about}
								alt="Виктория"
								className="aspect-[5/6] w-full object-cover"
							/>
						</div>
					</div>
					<div className="landing-bloom-reveal-right">
						<p className="text-sm font-semibold tracking-[0.2em] text-[#f97316] uppercase">
							Обо мне
						</p>
						<h2
							className={`mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl ${INK}`}
						>
							Привет! Я Виктория
						</h2>
						<p className="mt-5 text-lg leading-relaxed text-[#2e2440]/70">
							Преподаватель физики и математики и создатель {LANDING_BRAND}. Три
							высших образования, эксперт ЕГЭ — и спокойный путь к твоему баллу.
						</p>
						<div className="mt-8 space-y-4">
							{LANDING_WHY.map((why, i) => (
								<div
									key={why.title}
									className="landing-bloom-reveal flex gap-4 rounded-2xl border border-[#2e2440]/15 bg-white shadow-sm p-5"
									style={{
										animationRange: `entry ${i * 6}% cover ${38 + i * 6}%`,
									}}
								>
									<span
										className="mt-1 size-2.5 shrink-0 rounded-full bg-[#f97316]"
										aria-hidden
									/>
									<div>
										<p className="font-display font-semibold text-[#2e2440]">
											{why.title}
										</p>
										<p className="mt-1 text-sm text-[#2e2440]/65">{why.text}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Steps */}
			<section
				id="steps"
				className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
			>
				<div className="landing-bloom-blob left-[-10rem] bottom-0 h-[22rem] w-[22rem] bg-[#93c5fd]/40" />
				<div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-bloom-reveal text-sm font-semibold tracking-[0.2em] text-[#f97316] uppercase">
						Маршрут
					</p>
					<h2
						className={`landing-bloom-reveal mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl ${INK}`}
					>
						Как мы идём к баллу
					</h2>
					<div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{STEPS.map((step, i) => (
							<article
								key={step.n}
								className="landing-bloom-reveal-tilt landing-bloom-card relative rounded-3xl border border-[#2e2440]/15 bg-white shadow-sm p-6"
								style={{
									animationRange: `entry ${i * 5}% cover ${36 + i * 5}%`,
								}}
							>
								<p className="font-display text-5xl font-semibold text-[#f9a8d4]">
									{step.n}
								</p>
								<h3 className="mt-4 font-display text-lg font-semibold text-[#2e2440]">
									{step.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-[#2e2440]/65">
									{step.text}
								</p>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* Formats */}
			<section
				id="formats"
				className="scroll-mt-20 border-y border-[#2e2440]/10 bg-white/60 py-20 sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-bloom-reveal text-sm font-semibold tracking-[0.2em] text-[#f97316] uppercase">
						Форматы
					</p>
					<h2
						className={`landing-bloom-reveal mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl ${INK}`}
					>
						Выбери, как учиться
					</h2>
					<div className="mt-14 grid gap-6 lg:grid-cols-3">
						{LANDING_FORMATS.map((format, i) => (
							<article
								key={format.id}
								id={format.id}
								className={`landing-bloom-reveal-scale flex flex-col rounded-3xl border bg-white p-7 shadow-sm ${
									format.featured
										? "border-[#f97316]/50 ring-2 ring-[#f97316]/20"
										: "border-[#2e2440]/10"
								}`}
								style={{
									animationRange: `entry ${i * 5}% cover ${34 + i * 5}%`,
								}}
							>
								{format.featured ? (
									<p className="mb-3 self-start rounded-full bg-[#f97316] px-3 py-1 text-xs font-semibold text-white">
										Популярный
									</p>
								) : null}
								<h3 className="font-display text-2xl font-semibold text-[#2e2440]">
									{format.title}
								</h3>
								<p className="mt-3 font-display text-3xl font-semibold text-[#f97316]">
									{format.highlight}
								</p>
								<p className="mt-1 text-sm text-[#2e2440]/50">
									{format.highlightHint}
								</p>
								<p className="mt-4 text-sm leading-relaxed text-[#2e2440]/70">
									{format.lead}
								</p>
								<div className="mt-6 border-t border-dashed border-[#2e2440]/15 pt-5">
									<ul className="space-y-2 text-sm text-[#2e2440]/75">
										{format.points.map((point) => (
											<li key={point} className="flex gap-2">
												<span aria-hidden className="text-[#f97316]">
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
												? "bg-[#f97316] text-white hover:bg-[#fb923c]"
												: "bg-[#2e2440] text-white hover:bg-[#2e2440]/90"
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

			{/* Diplomas strip */}
			<section className="overflow-hidden py-16">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<h2
						className={`landing-bloom-reveal font-display text-2xl font-semibold tracking-tight sm:text-3xl ${INK}`}
					>
						Дипломы и результаты учеников
					</h2>
				</div>
				<div className="mt-10">
					<Marquee pauseOnHover className="[--duration:45s] [--gap:1.25rem]">
						{LANDING_IMAGES.diploms.map((src) => (
							<img
								key={src}
								src={src}
								alt="Диплом или результат ученика"
								className="landing-bloom-card h-40 w-auto rounded-2xl border border-[#2e2440]/15 bg-white object-contain p-2 shadow-sm sm:h-48"
							/>
						))}
					</Marquee>
				</div>
			</section>

			{/* Reviews */}
			<section
				id="reviews"
				className="scroll-mt-20 border-t border-[#2e2440]/10 py-20 sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="landing-bloom-reveal text-sm font-semibold tracking-[0.2em] text-[#f97316] uppercase">
						Отзывы
					</p>
					<h2
						className={`landing-bloom-reveal mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl ${INK}`}
					>
						Что говорят ученики
					</h2>
				</div>
				<div className="relative mt-12">
					<Marquee pauseOnHover className="[--duration:50s] [--gap:1.25rem]">
						{LANDING_REVIEWS.filter((_, i) => i % 2 === 0).map((review) => (
							<ReviewCard
								key={review.id}
								review={review}
								className="border-[#2e2440]/10 bg-white shadow-sm [&_blockquote]:text-[#2e2440]/80 [&_figcaption]:border-[#2e2440]/10 [&_figcaption_p:first-child]:text-[#2e2440] [&_figcaption_p:last-child]:text-[#2e2440]/50"
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
								className="border-[#2e2440]/10 bg-white shadow-sm [&_blockquote]:text-[#2e2440]/80 [&_figcaption]:border-[#2e2440]/10 [&_figcaption_p:first-child]:text-[#2e2440] [&_figcaption_p:last-child]:text-[#2e2440]/50"
							/>
						))}
					</Marquee>
				</div>
			</section>

			{/* FAQ */}
			<section
				id="faq"
				className="scroll-mt-20 border-y border-[#2e2440]/10 bg-white/60 py-20 sm:py-28"
			>
				<div className="mx-auto max-w-3xl px-4 sm:px-6">
					<p className="landing-bloom-reveal text-sm font-semibold tracking-[0.2em] text-[#f97316] uppercase">
						Вопросы
					</p>
					<h2
						className={`landing-bloom-reveal mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl ${INK}`}
					>
						Частые вопросы
					</h2>
					<Accordion type="single" collapsible className="mt-10 w-full">
						{LANDING_FAQ.map((item) => (
							<AccordionItem
								key={item.q}
								value={item.q}
								className="border-[#2e2440]/10"
							>
								<AccordionTrigger className="text-left text-base font-medium text-[#2e2440]">
									{item.q}
								</AccordionTrigger>
								<AccordionContent className="text-[#2e2440]/65">
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
				<div className="landing-bloom-blob left-[10%] top-0 h-[18rem] w-[18rem] bg-[#f9a8d4]/50" />
				<div className="landing-bloom-blob landing-bloom-blob-2 right-[10%] bottom-0 h-[18rem] w-[18rem] bg-[#93c5fd]/50" />
				<div className="relative z-10 mx-auto max-w-2xl px-4">
					<Rings className="landing-bloom-spin-slow mx-auto h-20 w-20 text-[#f97316]/50" />
					<h2
						className={`landing-bloom-reveal mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl ${INK}`}
					>
						{LANDING_TRIAL.title}
					</h2>
					<p className="landing-bloom-reveal mx-auto mt-5 max-w-lg text-lg text-[#2e2440]/65">
						{LANDING_TRIAL.body}
					</p>
					<Button
						asChild
						size="lg"
						className="landing-bloom-reveal-scale mt-10 rounded-full bg-[#f97316] px-10 text-white shadow-xl shadow-[#f97316]/30 hover:bg-[#fb923c]"
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
				testIdPrefix="landing-bloom"
				className="border-[#2e2440]/10 bg-[#2e2440] text-white [--pm-amber:#fb923c]"
			/>
		</div>
	);
}

export default BloomLanding;
