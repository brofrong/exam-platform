import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { LandingNav } from "#/features/landing/ui/landing-nav";
import { ReviewsMarquee } from "#/features/landing/ui/reviews-marquee";
import { SocialLinks } from "#/features/landing/ui/social-links";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/ui/particles";
import { cn } from "@/lib/utils";

const STATS = [
	{ value: "10 лет", label: "готовлю к экзаменам" },
	{ value: "95+", label: "сдала ЕГЭ три раза" },
	{ value: "200+", label: "учеников подготовила" },
	{ value: "Эксперт", label: "ЕГЭ по профилю" },
] as const;

const AUDIENCE = [
	{
		title: "Трудно в школе",
		text: "Ты в 5–11 классе и хочешь улучшить оценки и наконец понять математику или физику.",
	},
	{
		title: "С нуля к ОГЭ / ЕГЭ",
		text: "Был «на чиле» много лет — теперь нужен минимум по физике или математике без паники.",
	},
	{
		title: "Цель 80+",
		text: "Первая часть уже знакома — усиливаем вторую часть и системно идём к высокому баллу.",
	},
	{
		title: "Цель 90+ / «5»",
		text: "Разбираем самые сложные задачи ЕГЭ или готовимся к отличной оценке на ОГЭ.",
	},
	{
		title: "Больше практики",
		text: "Нужна регулярная тренировка в удобное время — без стресса и перегруза.",
	},
] as const;

const FORMATS = [
	{
		id: "individual",
		title: "Индивидуальные",
		highlight: "1 на 1",
		highlightHint: "максимум внимания",
		lead: "Системная программа с современными материалами и «докруткой» под твои интересы.",
		cta: "Выбрать индивидуальные",
		featured: true,
		why: "Если нужен персональный план и быстрый рост балла",
		points: [
			"Диагностика до урока",
			"Оплата после урока или за период",
			"Домашки с автопроверкой или проверкой мной",
			"Шаг за шагом к твоей цели",
		],
		variants: null,
	},
	{
		id: "marathons",
		title: "Марафоны",
		highlight: "Сам + платформа",
		highlightHint: "в своём ритме",
		lead: "Самостоятельное обучение с видеоуроками, домашкой и моей обратной связью.",
		cta: "Выбрать марафон",
		featured: false,
		why: "Если удобнее учиться самостоятельно и возвращаться к материалам",
		points: [
			"Учёба в своём ритме",
			"Теория и уроки в записи в кабинете",
			"Домашка с автопроверкой и пробники",
			"Регулярные повторения на платформе",
		],
		variants: [
			"ЕГЭ Профиль математика: 1–12 → ~70",
			"Вторая часть: 13, 15, 16 → ~82",
			"Полный курс 1–19 → до 100",
			"ЕГЭ Физика 1–20 → ~70",
		],
	},
	{
		id: "groups",
		title: "Групповые",
		highlight: "3–5 человек",
		highlightHint: "живая динамика",
		lead: "Группы по годовому, полугодовому или короткому плану перед экзаменом.",
		cta: "Выбрать группу",
		featured: false,
		why: "Если важны регулярные встречи и поддержка сверстников",
		points: [
			"Встречи 1–2 раза в неделю",
			"Оплата за период",
			"Доступ к платформе: ДЗ, видео, теория",
			"Ежедневная обратная связь в общем чате",
		],
		variants: [
			"Математика 70+ / 80+ / 90+",
			"Физика 70+",
			"1 раз в неделю по 1,5 часа",
		],
	},
] as const;

const WHY = [
	{
		title: "Атмосфера",
		text: "Физика и математика становятся лёгкими и интересными. Вместо давления — поддержка.",
	},
	{
		title: "Подход",
		text: "Подстраиваю программу под твои цели и создаю классную атмосферу на занятиях.",
	},
	{
		title: "Результат",
		text: "Системный подход и креативные методы — ты реально видишь прогресс.",
	},
] as const;

const FAQ = [
	{
		q: "Как проходят уроки?",
		a: "1–3 раза в неделю по 60 минут в Zoom: уроки, конспекты, домашка и прогресс — в одном кабинете. Много работы ученика на уроке, актуальные задания и теория.",
	},
	{
		q: "Когда ждать результаты?",
		a: "Первые ощутимые сдвиги обычно через месяц: быстрее счёт, больше уверенности, появляется база для сложных задач. Всё зависит от старта и регулярности ДЗ.",
	},
	{
		q: "Если пропустил — всё потеряно?",
		a: "Нет: материалы остаются на платформе, ключевое повторим на следующем уроке.",
	},
	{
		q: "Есть пробное занятие?",
		a: "Да: диагностика, цели и план на первый месяц.",
	},
	{
		q: "Можно ли переносить уроки?",
		a: "Можно при раннем предупреждении (за сутки) — фиксирую переносы в пакете и предлагаю альтернативные слоты.",
	},
	{
		q: "Много домашки?",
		a: "Вы выбираете цель сами. Главный принцип — регулярность без перегруза.",
	},
	{
		q: "Что с материалами?",
		a: "ФИПИ, современные курсы и методики плюс авторские разработки — дальше «докручиваю» под твои цели.",
	},
	{
		q: "Оплата и документы?",
		a: "Оплата поурочно или пакетами; чеки — по запросу.",
	},
] as const;

export function LandingPage() {
	return (
		<div className="landing light" data-testid="landing-page" id="top">
			<LandingNav />

			{/* Hero — brand + particles background */}
			<section className="landing-hero relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[color:var(--pm-navy)] pb-16 pt-28 sm:pb-24 sm:pt-24">
				<Particles
					className="absolute inset-0"
					quantity={140}
					ease={70}
					staticity={40}
					size={0.5}
					color="#e8a54b"
				/>
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,color-mix(in_oklab,var(--pm-navy)_55%,transparent)_70%,var(--pm-navy)_100%)]" />

				<div className="relative z-10 mx-auto flex w-full max-w-6xl justify-center px-4 text-center sm:px-6">
					<div className="w-full max-w-2xl">
						<p className="landing-fade font-display mb-4 text-4xl font-semibold tracking-[0.06em] text-white sm:text-5xl md:text-6xl">
							PHYS&MATH
						</p>
						<h1 className="landing-fade landing-fade-delay-1 text-balance text-3xl font-medium leading-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
							Необязательно быть «гением», чтобы сдать ЕГЭ и ОГЭ на высокий балл
						</h1>
						<p className="landing-fade landing-fade-delay-2 mt-5 text-pretty text-base text-white/80 sm:text-lg">
							Разберём всё по шагам — от базы до второй части вместе.
						</p>
						<div className="landing-fade landing-fade-delay-3 mt-8 flex flex-wrap justify-center gap-3">
							<Button
								asChild
								size="lg"
								className="bg-[color:var(--pm-amber)] px-6 text-[color:var(--pm-navy)] hover:bg-[color:var(--pm-amber-bright)]"
							>
								<a href="#trial" data-testid="landing-hero-cta">
									Хочу на урок
								</a>
							</Button>
							<Button
								asChild
								size="lg"
								variant="outline"
								className="border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white"
							>
								<a href="#about">Узнать обо мне</a>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* About */}
			<section
				id="about"
				className="scroll-mt-20 border-b border-white/10 bg-[color:var(--pm-navy)] py-20 text-white sm:py-28"
			>
				<div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
					<div>
						<p className="mb-3 text-sm font-medium tracking-wide text-[color:var(--pm-amber)] uppercase">
							Обо мне
						</p>
						<h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
							Привет! Я Виктория
						</h2>
						<p className="mt-5 max-w-xl text-pretty text-lg text-white/75">
							Преподаватель физики и математики и создатель{" "}
							<span className="text-white">PHYS&MATH</span>. Три высших
							образования, эксперт ЕГЭ — и спокойный путь к твоему баллу.
						</p>
						<div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
							{STATS.map((stat) => (
								<div key={stat.value}>
									<p className="font-display whitespace-nowrap text-2xl font-semibold text-[color:var(--pm-amber)] sm:text-3xl">
										{stat.value}
									</p>
									<p className="mt-1 text-sm text-white/65">{stat.label}</p>
								</div>
							))}
						</div>

						<div className="mt-10">
							<p className="mb-4 text-sm font-medium tracking-wide text-[color:var(--pm-amber)] uppercase">
								Соцсети
							</p>
							<SocialLinks
								size="lg"
								showLabels
								data-testid="landing-about-socials"
							/>
						</div>

						<Button
							asChild
							variant="link"
							className="mt-8 h-auto px-0 text-[color:var(--pm-amber)]"
						>
							<a href="#formats">Жми сюда, чтобы узнать обо мне больше →</a>
						</Button>
					</div>
					<div className="relative">
						<div className="absolute -inset-3 rounded-[2rem] bg-[color:var(--pm-amber)]/15 blur-2xl" />
						<img
							src="/landing/victoria-desk.webp"
							alt="Виктория — преподаватель PHYS&MATH"
							className="relative aspect-[4/5] w-full rounded-[1.5rem] object-cover shadow-2xl shadow-black/40 sm:aspect-[5/6]"
						/>
					</div>
				</div>
			</section>

			{/* Audience */}
			<section
				id="audience"
				className="scroll-mt-20 bg-[color:var(--pm-ink)] py-20 text-white sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<p className="mb-3 text-sm font-medium tracking-wide text-[color:var(--pm-amber)] uppercase">
						Для кого
					</p>
					<h2 className="font-display max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
						Мои занятия для тебя, если ты…
					</h2>
					<ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{AUDIENCE.map((item, index) => (
							<li key={item.title} className="border-t border-white/15 pt-5">
								<p className="text-xs tracking-[0.2em] text-white/40">
									{String(index + 1).padStart(2, "0")}
								</p>
								<h3 className="mt-3 font-display text-xl font-semibold whitespace-nowrap">
									{item.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-white/70">
									{item.text}
								</p>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* Formats — pricing-style cards */}
			<section
				id="formats"
				className="scroll-mt-20 bg-[color:var(--pm-cream)] py-20 text-[color:var(--pm-navy)] sm:py-28"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<div className="mx-auto max-w-2xl text-center">
						<p className="mb-3 text-sm font-medium tracking-wide text-[color:var(--pm-amber-deep)] uppercase">
							Форматы
						</p>
						<h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
							Как мы можем работать с тобой?
						</h2>
						<p className="mt-4 text-base text-[color:var(--pm-navy)]/70">
							Три понятных варианта — выбери тот, который совпадает с твоим
							темпом и целью.
						</p>
					</div>

					<div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
						{FORMATS.map((format) => (
							<article
								key={format.id}
								id={format.id}
								className={cn(
									"flex flex-col rounded-2xl border bg-white p-6 shadow-sm sm:p-7",
									format.featured
										? "border-[color:var(--pm-amber)] ring-1 ring-[color:var(--pm-amber)]/40"
										: "border-[color:var(--pm-navy)]/10",
								)}
							>
								<div className="flex flex-wrap items-center gap-2">
									<h3 className="font-display whitespace-nowrap text-xl font-semibold sm:text-2xl">
										{format.title}
									</h3>
									{format.featured ? (
										<span className="shrink-0 rounded-full bg-[color:var(--pm-amber)]/15 px-2.5 py-1 text-[11px] font-medium tracking-wide whitespace-nowrap text-[color:var(--pm-amber-deep)] uppercase">
											Чаще выбирают
										</span>
									) : null}
								</div>

								<p className="mt-5 font-display whitespace-nowrap text-3xl font-semibold tracking-tight sm:text-4xl">
									{format.highlight}
								</p>
								<p className="mt-1 text-sm text-[color:var(--pm-navy)]/55">
									{format.highlightHint}
								</p>
								<p className="mt-4 text-sm leading-relaxed text-[color:var(--pm-navy)]/75">
									{format.lead}
								</p>
								<p className="mt-3 text-sm font-medium text-[color:var(--pm-navy)]">
									{format.why}
								</p>

								<Button
									asChild
									className={cn(
										"mt-6 w-full",
										format.featured
											? "bg-[color:var(--pm-amber)] text-[color:var(--pm-navy)] hover:bg-[color:var(--pm-amber-bright)]"
											: "bg-[color:var(--pm-navy)] text-white hover:bg-[color:var(--pm-navy)]/90",
									)}
								>
									<a href="#trial">{format.cta}</a>
								</Button>

								<div className="mt-7 border-t border-[color:var(--pm-navy)]/10 pt-6">
									<p className="text-xs font-medium tracking-wide text-[color:var(--pm-navy)]/50 uppercase">
										Что внутри
									</p>
									<ul className="mt-4 space-y-3">
										{format.points.map((point) => (
											<li
												key={point}
												className="flex gap-2.5 text-sm leading-relaxed text-[color:var(--pm-navy)]/80"
											>
												<Check
													className="mt-0.5 size-4 shrink-0 text-[color:var(--pm-amber-deep)]"
													aria-hidden
												/>
												{point}
											</li>
										))}
									</ul>
								</div>

								{format.variants ? (
									<div className="mt-6 rounded-xl bg-[color:var(--pm-cream)]/80 p-4">
										<p className="text-xs font-medium tracking-wide text-[color:var(--pm-amber-deep)] uppercase">
											Варианты
										</p>
										<ul className="mt-2 space-y-1.5 text-sm text-[color:var(--pm-navy)]/75">
											{format.variants.map((line) => (
												<li key={line}>{line}</li>
											))}
										</ul>
									</div>
								) : (
									<div className="mt-auto hidden lg:block" aria-hidden />
								)}
							</article>
						))}
					</div>
				</div>
			</section>

			{/* Trial CTA */}
			<section
				id="trial"
				className="scroll-mt-20 bg-[color:var(--pm-navy)] py-24 sm:py-32"
			>
				<div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
					<h2 className="font-display text-balance text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
						Начни заниматься физикой или математикой уже сегодня
					</h2>
					<p className="mx-auto mt-5 max-w-xl text-pretty text-white/75">
						Запишись на бесплатный 30-минутный урок, чтобы познакомиться с
						преподавателем и подходом — и уже после принять решение.
					</p>
					<Button
						asChild
						size="lg"
						className="mt-8 bg-[color:var(--pm-amber)] px-8 text-[color:var(--pm-navy)] hover:bg-[color:var(--pm-amber-bright)]"
					>
						<a
							href="https://t.me/math_physics_2020"
							target="_blank"
							rel="noreferrer"
							data-testid="landing-trial-cta"
						>
							Хочу на урок
						</a>
					</Button>
				</div>
			</section>

			{/* Why */}
			<section className="bg-[color:var(--pm-ink)] py-20 text-white sm:py-28">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<h2 className="font-display max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
						Почему занятия со мной работают?
					</h2>
					<div className="mt-12 grid gap-10 md:grid-cols-3">
						{WHY.map((item) => (
							<div key={item.title}>
								<h3 className="font-display text-xl font-semibold whitespace-nowrap text-[color:var(--pm-amber)]">
									{item.title}
								</h3>
								<p className="mt-3 text-sm leading-relaxed text-white/70">
									{item.text}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Reviews */}
			<ReviewsMarquee />

			{/* FAQ */}
			<section
				id="faq"
				className="scroll-mt-20 bg-[color:var(--pm-cream)] py-20 text-[color:var(--pm-navy)] sm:py-28"
			>
				<div className="mx-auto max-w-3xl px-4 sm:px-6">
					<p className="mb-3 text-sm font-medium tracking-wide text-[color:var(--pm-amber-deep)] uppercase">
						Вопросы
					</p>
					<h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
						Остались вопросы?
					</h2>
					<Accordion type="single" collapsible className="mt-10 w-full">
						{FAQ.map((item) => (
							<AccordionItem key={item.q} value={item.q}>
								<AccordionTrigger className="text-left text-base font-medium">
									{item.q}
								</AccordionTrigger>
								<AccordionContent className="text-[color:var(--pm-navy)]/75">
									{item.a}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-white/10 bg-[color:var(--pm-navy)] py-14 text-white">
				<div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
					<div>
						<p className="font-display text-2xl font-semibold tracking-[0.06em]">
							PHYS&MATH
						</p>
						<p className="mt-3 max-w-sm text-sm text-white/60">
							© 2026 Самозанятая Скачкова Виктория Олеговна
						</p>
						<SocialLinks
							size="lg"
							className="mt-5"
							data-testid="landing-footer-socials"
						/>
					</div>
					<div className="flex flex-col gap-2 text-sm">
						<a
							href="https://t.me/math_physics_2020"
							target="_blank"
							rel="noreferrer"
							className="text-white/80 no-underline hover:text-[color:var(--pm-amber)]"
						>
							Написать в Telegram
						</a>
						<Link
							to="/login"
							className="text-white/80 no-underline hover:text-[color:var(--pm-amber)]"
						>
							Войти на платформу
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
