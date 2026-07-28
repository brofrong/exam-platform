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
	{ href: "#ch1", label: "I" },
	{ href: "#ch2", label: "II" },
	{ href: "#ch3", label: "III" },
	{ href: "#formats", label: "Форматы" },
	{ href: "#trial", label: "Финал" },
] as const;

const CHAPTERS = [
	{
		id: "ch1",
		roman: "I",
		title: "Где ломается уверенность",
		body: "Обычно не в «сложных задачах». А раньше: пропущенная тема в 7–8 классе, страх ошибиться у доски, привычка угадывать первую часть. Пока это не названо — любой учебник кажется врагом.",
		image: LANDING_IMAGES.about,
	},
	{
		id: "ch2",
		roman: "II",
		title: "Что мы делаем иначе",
		body: "Не «проходим программу». Собираем карту пробелов, ставим цель в баллах и идём короткими спринтами. На платформе видно прогресс по темам — без тумана «вроде понял».",
		image: LANDING_IMAGES.whiteboard,
	},
	{
		id: "ch3",
		roman: "III",
		title: "Кем становится ученик",
		body: "Тот, кто знает, зачем открывает тетрадь. Спокойнее на пробниках. Умеет объяснить решение, а не только обвести ответ. И да — балл растёт. Но сначала возвращается ощущение «я могу».",
		image: LANDING_IMAGES.desk,
	},
] as const;

/**
 * Story — magazine long-form.
 * Paper + burgundy, roman chapters, formats at the end.
 */
export function StoryLanding() {
	return (
		<div
			className="landing landing-story light"
			data-testid="landing-page-story"
			id="top"
		>
			<LandingNav
				activeVersion="story"
				solid
				links={NAV}
				barClassName="border-[#3d1f28]/40 bg-[#2a151c]/95"
			/>

			{/* Magazine masthead */}
			<section className="bg-[#ebe4d4] pb-16 pt-28 text-[#1c1210] sm:pb-24 sm:pt-36">
				<div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
					<p className="landing-fade font-display text-sm tracking-[0.4em] text-[#6b2d3c] uppercase">
						{LANDING_BRAND} · выпуск
					</p>
					<h1 className="landing-fade landing-fade-delay-1 mt-8 font-display text-4xl font-semibold leading-[1.1] sm:text-6xl md:text-7xl">
						История одного
						<br />
						экзаменационного
						<br />
						спокойствия
					</h1>
					<p className="landing-fade landing-fade-delay-2 mx-auto mt-8 max-w-md text-lg leading-relaxed text-[#1c1210]/65">
						Не курс «для всех». Личный маршрут от паники к баллу — глазами
						преподавателя Виктории.
					</p>
					<div className="landing-fade landing-fade-delay-3 mt-10">
						<a
							href="#ch1"
							className="font-display text-sm tracking-wide text-[#6b2d3c] underline underline-offset-8"
							data-testid="landing-hero-cta"
						>
							Читать с главы I
						</a>
					</div>
				</div>
			</section>

			{/* Chapters — alternating */}
			{CHAPTERS.map((chapter, index) => (
				<section
					key={chapter.id}
					id={chapter.id}
					className={`scroll-mt-20 ${index % 2 === 0 ? "bg-[#f3eee3]" : "bg-[#ebe4d4]"} py-20 text-[#1c1210] sm:py-28`}
				>
					<div
						className={`mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 ${
							index % 2 === 1 ? "lg:[&>img]:order-2" : ""
						}`}
					>
						<img
							src={chapter.image}
							alt=""
							className="aspect-[4/5] w-full object-cover"
						/>
						<div className="landing-reveal">
							<p className="font-display text-5xl text-[#6b2d3c]/35 sm:text-7xl">
								{chapter.roman}
							</p>
							<h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
								{chapter.title}
							</h2>
							<p className="mt-6 text-lg leading-relaxed text-[#1c1210]/75">
								{chapter.body}
							</p>
						</div>
					</div>
				</section>
			))}

			{/* Pull quotes — horizontal scroll */}
			<section className="border-y border-[#1c1210]/10 bg-[#2a151c] py-16 text-[#ebe4d4] sm:py-20">
				<p className="mx-auto max-w-6xl px-4 font-display text-sm tracking-[0.3em] text-[#c4a4ae] uppercase sm:px-6">
					Из писем учеников
				</p>
				<div className="landing-story-scroll mt-10 flex gap-6 overflow-x-auto px-4 pb-4 sm:px-6">
					{LANDING_REVIEWS.slice(0, 6).map((review) => (
						<figure
							key={review.id}
							className="w-[min(85vw,22rem)] shrink-0 border border-[#ebe4d4]/20 p-6"
						>
							<blockquote className="font-display text-xl leading-snug">
								«{review.quote}»
							</blockquote>
							<figcaption className="mt-6 text-xs tracking-wide text-[#c4a4ae]">
								{review.name} — {review.meta}
							</figcaption>
						</figure>
					))}
				</div>
			</section>

			{/* Formats late */}
			<section
				id="formats"
				className="scroll-mt-20 bg-[#ebe4d4] py-20 text-[#1c1210] sm:py-28"
			>
				<div className="mx-auto max-w-3xl px-4 sm:px-6">
					<p className="font-display text-sm tracking-[0.3em] text-[#6b2d3c] uppercase">
						Практическая часть
					</p>
					<h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
						Если решил остаться в истории — выбери формат
					</h2>
					<ul className="mt-14 space-y-8">
						{LANDING_FORMATS.map((format) => (
							<li
								key={format.id}
								id={format.id}
								className="border-t border-[#1c1210]/15 pt-8"
							>
								<div className="flex flex-wrap items-baseline justify-between gap-2">
									<h3 className="font-display text-2xl font-semibold">
										{format.title}
									</h3>
									<span className="text-sm text-[#6b2d3c]">
										{format.highlight}
									</span>
								</div>
								<p className="mt-3 text-[#1c1210]/7">{format.lead}</p>
								<a
									href="#trial"
									className="mt-4 inline-block text-sm text-[#6b2d3c] underline underline-offset-4"
								>
									{format.cta}
								</a>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* Author card */}
			<section className="bg-[#f3eee3] py-16 sm:py-20">
				<div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 text-center sm:px-6">
					<img
						src={LANDING_IMAGES.portrait}
						alt="Виктория"
						className="aspect-[3/4] w-40 object-cover sm:w-48"
					/>
					<div>
						<p className="font-display text-sm tracking-[0.25em] text-[#6b2d3c] uppercase">
							Автор курса
						</p>
						<h2 className="mt-2 font-display text-3xl font-semibold text-[#1c1210]">
							Виктория
						</h2>
						<p className="mx-auto mt-4 max-w-md text-[#1c1210]/65">
							Преподаватель физики и математики. Эксперт ЕГЭ. Пишет программы
							так, чтобы у ученика оставалась история успеха — а не стопка
							конспектов.
						</p>
					</div>
				</div>
			</section>

			<section
				id="trial"
				className="scroll-mt-20 bg-[#2a151c] py-28 text-center text-[#ebe4d4] sm:py-36"
			>
				<div className="mx-auto max-w-xl px-4">
					<p className="font-display text-sm tracking-[0.35em] text-[#c4a4ae] uppercase">
						Эпилог
					</p>
					<h2 className="mt-6 font-display text-4xl font-semibold sm:text-5xl">
						Напиши — начнём новую главу
					</h2>
					<p className="mt-6 text-[#ebe4d4]/65">{LANDING_TRIAL.body}</p>
					<Button
						asChild
						size="lg"
						className="mt-10 rounded-none bg-[#ebe4d4] px-10 text-[#2a151c] hover:bg-white"
					>
						<a
							href={LANDING_TRIAL.href}
							target="_blank"
							rel="noreferrer"
							data-testid="landing-trial-cta"
						>
							Открыть Telegram
						</a>
					</Button>
				</div>
			</section>

			<LandingFooter
				testIdPrefix="landing-story"
				className="border-[#3d1f28] bg-[#1c0e14] [--pm-amber:#c4a4ae]"
			/>
		</div>
	);
}

export default StoryLanding;
